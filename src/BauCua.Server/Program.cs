using BauCua.Server.Game;

var builder = WebApplication.CreateBuilder(args);

// Thêm các dịch vụ vào container
builder.Services.AddSignalR();
builder.Services.AddSingleton<GameServer>();
// builder.Services.AddHostedService<GameLoopService>(); // Đã tắt vòng lặp tự động

builder.Services.AddControllers();

// Cấu hình CORS cho Client
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseDefaultFiles();

var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
provider.Mappings[".m4a"] = "audio/mp4";
provider.Mappings[".mp4"] = "video/mp4";

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});
app.UseCors("AllowClient");
app.UseAuthorization();

app.MapControllers();
app.MapHub<BauCuaHub>("/baucua-hub"); 

app.Run();
