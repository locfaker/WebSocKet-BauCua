namespace BauCua.Shared.Models;

public class BetRequest
{
    public DiceSymbol Symbol { get; set; }
    public long Amount { get; set; }
}

public class GameStateUpdate
{
    public GamePhase CurrentPhase { get; set; }
    public int TimeRemaining { get; set; }
    public List<DiceSymbol>? LastResult { get; set; }
}
