using System.Reflection;
using System.Linq.Expressions;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using HotChocolate.Data.Filters;
using HotChocolate.Data.Sorting;
using HotChocolate.Types;
using HotChocolate.Execution.Configuration;

namespace FixSys.Api.GraphQL;

public static class ScopedEntityTypes
{
    public static Expression<Func<TEntity, object>> Property<TEntity>(PropertyInfo property)
    {
        var entity = Expression.Parameter(typeof(TEntity), "entity");
        return Expression.Lambda<Func<TEntity, object>>(Expression.Convert(Expression.Property(entity, property), typeof(object)), entity);
    }
    public static IEnumerable<PropertyInfo> ProtectedNavigations(Type type) => type.GetProperties().Where(property =>
        typeof(Entity).IsAssignableFrom(property.PropertyType) ||
        property.PropertyType.IsGenericType && property.PropertyType.GetGenericArguments().Any(argument => typeof(BranchEntity).IsAssignableFrom(argument)));

    public static IRequestExecutorBuilder AddScopedEntityTypes(this IRequestExecutorBuilder builder)
    {
        foreach (var type in typeof(Customer).Assembly.GetTypes().Where(type => !type.IsAbstract && typeof(Entity).IsAssignableFrom(type) && type != typeof(AppUser) && type != typeof(OtpCode)))
            builder.AddType(typeof(ScopedEntityType<>).MakeGenericType(type));
        return builder;
    }
}

public class ScopedEntityType<TEntity> : ObjectType<TEntity> where TEntity : Entity
{
    protected override void Configure(IObjectTypeDescriptor<TEntity> descriptor)
    {
        foreach (var property in ScopedEntityTypes.ProtectedNavigations(typeof(TEntity))) descriptor.Field(property).Ignore();
    }
}

public class ScopedEntityFilter<TEntity> : FilterInputType<TEntity> where TEntity : Entity
{
    protected override void Configure(IFilterInputTypeDescriptor<TEntity> descriptor)
    {
        foreach (var property in ScopedEntityTypes.ProtectedNavigations(typeof(TEntity))) descriptor.Field(ScopedEntityTypes.Property<TEntity>(property)).Ignore();
    }
}

public class ScopedEntitySort<TEntity> : SortInputType<TEntity> where TEntity : Entity
{
    protected override void Configure(ISortInputTypeDescriptor<TEntity> descriptor)
    {
        foreach (var property in ScopedEntityTypes.ProtectedNavigations(typeof(TEntity)).Where(property => typeof(Entity).IsAssignableFrom(property.PropertyType))) descriptor.Field(ScopedEntityTypes.Property<TEntity>(property)).Ignore();
    }
}
