namespace BauCua.Shared.Models;

/// <summary>Trạng thái game</summary>
public enum GamePhase
{
    Waiting,      // Chờ người chơi
    Betting,      // Đặt cược
    Result,       // Xổ kết quả
    Announcement  // Thông báo
}
