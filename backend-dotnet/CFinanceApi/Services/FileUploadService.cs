namespace CFinanceApi.Services;

public interface IFileUploadService
{
    Task<string?> SaveReceiptAsync(IFormFile? file);
    void DeleteReceipt(string? filename);
    string GetUploadPath();
}

public class FileUploadService : IFileUploadService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".png", ".jpg", ".jpeg", ".gif", ".pdf"
    };

    public FileUploadService(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    public string GetUploadPath()
    {
        var uploadPath = _configuration["Upload:Path"] ?? Path.Combine(_environment.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadPath);
        return uploadPath;
    }

    public async Task<string?> SaveReceiptAsync(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return null;

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
            return null;

        // Check max file size (16MB)
        var maxSize = _configuration.GetValue<long>("Upload:MaxSize", 16 * 1024 * 1024);
        if (file.Length > maxSize)
            return null;

        // Generate unique filename
        var uniqueFilename = $"{Guid.NewGuid()}{extension.ToLower()}";
        var filePath = Path.Combine(GetUploadPath(), uniqueFilename);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return uniqueFilename;
    }

    public void DeleteReceipt(string? filename)
    {
        if (string.IsNullOrWhiteSpace(filename))
            return;

        var filePath = Path.Combine(GetUploadPath(), filename);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }
}
