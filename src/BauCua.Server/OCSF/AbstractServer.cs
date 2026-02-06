using System.Collections.Concurrent;

namespace BauCua.Server.OCSF;

public abstract class AbstractServer
{
    protected ConcurrentDictionary<string, ConnectionToClient> Clients { get; } = new();

    public virtual void ClientConnected(string connectionId)
    {
        var client = new ConnectionToClient(connectionId);
        Clients.TryAdd(connectionId, client);
        OnClientConnected(client);
    }

    public virtual void ClientDisconnected(string connectionId)
    {
        if (Clients.TryRemove(connectionId, out var client))
        {
            OnClientDisconnected(client);
        }
    }

    protected abstract void OnClientConnected(ConnectionToClient client);
    protected abstract void OnClientDisconnected(ConnectionToClient client);
    public abstract Task HandleMessage(string connectionId, object message);
}
