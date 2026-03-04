# Script to replace ZaloAuthGuard with FlexibleAuthGuard across all files

$srcPath = "src"
$files = Get-ChildItem -Path $srcPath -Recurse -Filter "*.ts" | Where-Object { $_.FullName -notmatch "\\node_modules\\" }

$replacements = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "ZaloAuthGuard") {
        Write-Host "Processing: $($file.FullName)"
        
        # Replace import statements
        $newContent = $content -replace "import { ZaloAuthGuard } from[^;]+zalo-auth\.guard[^;]*;", ""
        
        # Add FlexibleAuthGuard import if not exists
        if ($newContent -notmatch "FlexibleAuthGuard") {
            # Find existing auth imports or add after NestJS imports
            if ($newContent -match "(import\s+{[^}]*}\s+from\s+'@nestjs/common';)") {
                $newContent = $newContent -replace "(import\s+{[^}]*}\s+from\s+'@nestjs/common';)", "`$1`nimport { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';"
            } elseif ($newContent -match "(import[^;]*from\s+'@nestjs/[^']+';)") {
                $newContent = $newContent -replace "(import[^;]*from\s+'@nestjs/[^']+';)", "`$1`nimport { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';"
            }
        }
        
        # Replace @UseGuards(ZaloAuthGuard) with @UseGuards(FlexibleAuthGuard)
        $newContent = $newContent -replace "@UseGuards\(ZaloAuthGuard\)", "@UseGuards(FlexibleAuthGuard)"
        
        # Replace class-level guard
        $newContent = $newContent -replace "@Controller\([^)]*\)\s*@UseGuards\(ZaloAuthGuard\)", "@Controller(`$1)`n@UseGuards(FlexibleAuthGuard)"
        
        Set-Content $file.FullName -Value $newContent -NoNewline
        $replacements += $file.FullName
    }
}

Write-Host "`nCompleted! Modified $($replacements.Count) files:"
$replacements | ForEach-Object { Write-Host "  - $_" }
