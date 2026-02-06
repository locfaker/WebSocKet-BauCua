using System.Security.Cryptography;
using BauCua.Shared.Models;

namespace BauCua.Server.Game;

public class DiceEngine
{
    public List<DiceSymbol> Roll()
    {
        var result = new List<DiceSymbol>();
        for (int i = 0; i < 3; i++)
        {
            // Sử dụng RandomNumberGenerator để đảm bảo tính ngẫu nhiên bảo mật cho game
            int randomVal = RandomNumberGenerator.GetInt32(0, 6);
            result.Add((DiceSymbol)randomVal);
        }
        return result;
    }
}
