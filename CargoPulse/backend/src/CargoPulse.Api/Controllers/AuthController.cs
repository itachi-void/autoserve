using CargoPulse.Application.Common.Interfaces;
using CargoPulse.Application.DTOs;
using CargoPulse.Domain.Entities;
using CargoPulse.Domain.Enums;
using CargoPulse.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(IAppDbContext context, IJwtTokenService jwtTokenService, ICurrentUserService currentUserService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _currentUserService = currentUserService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.IsActive);

        if (user == null || !PasswordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        var userDto = new UserDto(
            user.Id,
            user.TenantId,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.PreferredLanguage,
            user.Tenant?.NameAr ?? user.Tenant?.Name ?? "CargoPulse",
            user.Tenant?.CurrencyCode ?? "SAR"
        );

        return Ok(new AuthResponse(accessToken, refreshToken, userDto));
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (emailExists)
        {
            return BadRequest(new { message = "Email already registered." });
        }

        var tenant = new Tenant
        {
            Name = request.CompanyName,
            NameAr = string.IsNullOrWhiteSpace(request.CompanyNameAr) ? request.CompanyName : request.CompanyNameAr,
            Code = "TEN-" + Guid.NewGuid().ToString("N")[..6].ToUpper(),
            CurrencyCode = "SAR",
            IsActive = true
        };
        _context.Tenants.Add(tenant);

        var user = new User
        {
            TenantId = tenant.Id,
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            PasswordHash = PasswordService.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Admin,
            PreferredLanguage = "ar",
            IsActive = true
        };
        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        var userDto = new UserDto(
            user.Id,
            user.TenantId,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.PreferredLanguage,
            tenant.NameAr,
            tenant.CurrencyCode
        );

        return Ok(new AuthResponse(accessToken, refreshToken, userDto));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        if (_currentUserService.UserId == null)
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId);

        if (user == null)
            return NotFound();

        return Ok(new UserDto(
            user.Id,
            user.TenantId,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Role,
            user.PreferredLanguage,
            user.Tenant?.NameAr ?? user.Tenant?.Name ?? "CargoPulse",
            user.Tenant?.CurrencyCode ?? "SAR"
        ));
    }
}
