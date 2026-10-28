using HotChocolate;
using FixSys.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Api.GraphQL;

public class AppErrorFilter : IErrorFilter
{
    public IError OnError(IError error) => error.Exception switch
    {
        AppException ex => ErrorBuilder.New().SetMessage(ex.Message).SetCode(ex.Code).Build(),
        DbUpdateConcurrencyException => ErrorBuilder.New()
            .SetMessage("تم تعديل هذا السجل من مستخدم آخر، أعد المحاولة").SetCode("CONFLICT").Build(),
        DbUpdateException => ErrorBuilder.New().SetMessage("تعذّر حفظ السجل: تحقق من عدم تكرار البيانات أو ارتباطها بسجلات أخرى").SetCode("DATA_CONFLICT").Build(),
        _ => error,
    };
}
