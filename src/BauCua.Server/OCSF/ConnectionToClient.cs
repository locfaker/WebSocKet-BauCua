using System.Collections.Concurrent;

namespace BauCua.Server.OCSF;

public class ConnectionToClient
{
    public string ConnectionId { get; }
    public ConcurrentDictionary<string, object> Info { get; } = new();

    public ConnectionToClient(string connectionId)
    {
        ConnectionId = connectionId;
    }

    public T? GetInfo<T>(string key) => Info.TryGetValue(key, out var val) ? (T)val : default;
    public void SetInfo(string key, object value) => Info[key] = value;
}
