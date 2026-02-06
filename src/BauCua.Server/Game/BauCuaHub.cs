using Microsoft.AspNetCore.SignalR;
using BauCua.Shared.Models;

namespace BauCua.Server.Game;

public class BauCuaHub : Hub
{
    private readonly GameServer _gameServer;

    public BauCuaHub(GameServer gameServer)
    {
        _gameServer = gameServer;
    }

    // Khi client kết nối
    public override async Task OnConnectedAsync()
    {
        _gameServer.ClientConnected(Context.ConnectionId);
        // Gửi số dư ban đầu cho client
        await Clients.Caller.SendAsync("UpdateBalance", _gameServer.GetBalance(Context.ConnectionId));
        await base.OnConnectedAsync();
    }

    // Khi client ngắt kết nối
    public override Task OnDisconnectedAsync(Exception? exception)
    {
        _gameServer.ClientDisconnected(Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }

    // Đặt cược
    public async Task PlaceBet(BetRequest bet)
    {
        var success = _gameServer.ProcessBet(Context.ConnectionId, bet);
        if (success)
        {
            await Clients.Caller.SendAsync("UpdateBalance", _gameServer.GetBalance(Context.ConnectionId));
        }
        else
        {
            await Clients.Caller.SendAsync("BetFailed", "Không đủ tiền!");
        }
    }

    // Lắc xúc xắc
    public async Task RollDice()
    {
        var connectionId = Context.ConnectionId;
        
        // Kiểm tra client có đặt cược chưa
        if (!_gameServer.HasBets(connectionId))
        {
            await Clients.Caller.SendAsync("RollFailed", "Bạn chưa đặt cược!");
            return;
        }

        // Lắc xúc xắc
        var diceResult = _gameServer.ExecuteRoll();
        
        // Chờ 2 giây để animation lắc chạy
        await Task.Delay(2000);
        
        // Gửi kết quả cho client này
        await Clients.Caller.SendAsync("ReceiveDiceResult", diceResult);
        
        // Tính kết quả thắng thua cho client này
        var winAmount = _gameServer.CalculatePlayerResult(connectionId, diceResult);
        
        if (winAmount > 0)
        {
            await Clients.Caller.SendAsync("ReceiveWin", new { 
                Amount = winAmount, 
                NewBalance = _gameServer.GetBalance(connectionId) 
            });
        }
        else
        {
            await Clients.Caller.SendAsync("ReceiveLose");
        }
    }
}
