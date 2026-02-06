using BauCua.Server.OCSF;
using BauCua.Shared.Models;
using System.Collections.Concurrent;

namespace BauCua.Server.Game;

public class GameServer : AbstractServer
{
    private readonly DiceEngine _diceEngine = new();
    private readonly ConcurrentDictionary<string, List<BetRequest>> _currentBets = new();
    private readonly ConcurrentDictionary<string, long> _balances = new();

    private const long INITIAL_BALANCE = 10000;

    // Khi client kết nối
    protected override void OnClientConnected(ConnectionToClient client)
    {
        _balances.TryAdd(client.ConnectionId, INITIAL_BALANCE);
    }

    // Khi client ngắt kết nối
    protected override void OnClientDisconnected(ConnectionToClient client)
    {
        _currentBets.TryRemove(client.ConnectionId, out _);
        _balances.TryRemove(client.ConnectionId, out _);
    }

    public override Task HandleMessage(string connectionId, object message)
    {
        return Task.CompletedTask;
    }

    // Xử lý đặt cược
    public bool ProcessBet(string connectionId, BetRequest bet)
    {
        if (!_balances.TryGetValue(connectionId, out long balance) || balance < bet.Amount)
        {
            return false;
        }

        // Trừ tiền
        _balances[connectionId] -= bet.Amount;

        // Lưu cược
        _currentBets.AddOrUpdate(connectionId,
            new List<BetRequest> { bet },
            (id, list) => { list.Add(bet); return list; });

        return true;
    }

    // Kiểm tra client có cược chưa
    public bool HasBets(string connectionId)
    {
        return _currentBets.TryGetValue(connectionId, out var bets) && bets.Count > 0;
    }

    // Lắc xúc xắc
    public List<DiceSymbol> ExecuteRoll()
    {
        return _diceEngine.Roll();
    }

    // Tính kết quả cho 1 client
    public long CalculatePlayerResult(string connectionId, List<DiceSymbol> diceResult)
    {
        if (!_currentBets.TryRemove(connectionId, out var bets))
        {
            return 0;
        }

        long totalWin = 0;

        foreach (var bet in bets)
        {
            int matches = diceResult.Count(d => d == bet.Symbol);
            if (matches > 0)
            {
                // Thắng = tiền cược gốc + thưởng (số lần xuất hiện * tiền cược)
                totalWin += bet.Amount + (bet.Amount * matches);
            }
        }

        if (totalWin > 0)
        {
            _balances.AddOrUpdate(connectionId, totalWin, (id, old) => old + totalWin);
        }

        return totalWin;
    }

    // Lấy số dư
    public long GetBalance(string connectionId)
    {
        return _balances.GetValueOrDefault(connectionId, 0);
    }
}
