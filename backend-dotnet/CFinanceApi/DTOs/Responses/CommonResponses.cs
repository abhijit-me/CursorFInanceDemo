namespace CFinanceApi.DTOs.Responses;

public class ErrorResponse
{
    public string Error { get; set; } = string.Empty;
}

public class MessageResponse
{
    public string Message { get; set; } = string.Empty;
}

public class MessageWithDataResponse<T>
{
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
}
