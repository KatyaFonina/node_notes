# Скрипт для тестирования всех API эндпоинтов
# Использование: .\test-api.ps1

# Настройка кодировки для корректного отображения
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://localhost:3000"
$notes = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Тестирование Notes REST API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Проверка API
Write-Host "[1/10] Проверка API..." -ForegroundColor Yellow
try {
    $apiInfo = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✓ API работает" -ForegroundColor Green
    Write-Host "  Доступные эндпоинты:" -ForegroundColor Gray
    $apiInfo.endpoints.PSObject.Properties | ForEach-Object {
        Write-Host "    $($_.Name): $($_.Value)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Ошибка подключения к API: $_" -ForegroundColor Red
    Write-Host "  Убедитесь, что сервер запущен на $baseUrl" -ForegroundColor Yellow
    Write-Host "  Продолжаем тестирование..." -ForegroundColor Yellow
}
Write-Host ""

# 2. Создание первой заметки
Write-Host "[2/10] Создание первой заметки..." -ForegroundColor Yellow
try {
    $body1 = @{
        title = "Тестовая заметка 1"
        content = "Содержимое первой тестовой заметки"
    } | ConvertTo-Json
    
    $note1 = Invoke-RestMethod -Uri "$baseUrl/note/" -Method POST -ContentType "application/json" -Body $body1
    Write-Host "✓ Заметка создана" -ForegroundColor Green
    Write-Host "  ID: $($note1._id)" -ForegroundColor Gray
    Write-Host "  Title: $($note1.title)" -ForegroundColor Gray
    $notes += $note1
} catch {
    Write-Host "✗ Ошибка: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Создание второй заметки
Write-Host "[3/10] Создание второй заметки..." -ForegroundColor Yellow
try {
    $body2 = @{
        title = "Тестовая заметка 2"
        content = "Содержимое второй тестовой заметки"
    } | ConvertTo-Json
    
    $note2 = Invoke-RestMethod -Uri "$baseUrl/note/" -Method POST -ContentType "application/json" -Body $body2
    Write-Host "✓ Заметка создана" -ForegroundColor Green
    Write-Host "  ID: $($note2._id)" -ForegroundColor Gray
    Write-Host "  Title: $($note2.title)" -ForegroundColor Gray
    $notes += $note2
} catch {
    Write-Host "✗ Ошибка: $_" -ForegroundColor Red
}
Write-Host ""

# 4. Получение всех заметок
Write-Host "[4/10] Получение всех заметок..." -ForegroundColor Yellow
try {
    $allNotes = Invoke-RestMethod -Uri "$baseUrl/notes" -Method GET
    Write-Host "✓ Найдено заметок: $($allNotes.Count)" -ForegroundColor Green
    $allNotes | ForEach-Object {
        Write-Host "  - $($_.title) (ID: $($_._id))" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Ошибка: $_" -ForegroundColor Red
}
Write-Host ""

# 5. Получение заметки по ID
Write-Host "[5/10] Получение заметки по ID..." -ForegroundColor Yellow
if ($notes.Count -gt 0) {
    try {
        $noteId = $notes[0]._id
        $noteById = Invoke-RestMethod -Uri "$baseUrl/note/$noteId" -Method GET
        Write-Host "✓ Заметка найдена" -ForegroundColor Green
        Write-Host "  Title: $($noteById.title)" -ForegroundColor Gray
        Write-Host "  Content: $($noteById.content)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Ошибка: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Пропущено (нет заметок)" -ForegroundColor Yellow
}
Write-Host ""

# 6. Получение заметки по названию
Write-Host "[6/10] Получение заметки по названию..." -ForegroundColor Yellow
if ($notes.Count -gt 0) {
    try {
        $title = $notes[0].title
        $encodedTitle = [System.Web.HttpUtility]::UrlEncode($title)
        $noteByTitle = Invoke-RestMethod -Uri "$baseUrl/note/read/$encodedTitle" -Method GET
        Write-Host "✓ Заметка найдена" -ForegroundColor Green
        Write-Host "  Title: $($noteByTitle.title)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Ошибка: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Пропущено (нет заметок)" -ForegroundColor Yellow
}
Write-Host ""

# 7. Обновление заметки
Write-Host "[7/10] Обновление заметки..." -ForegroundColor Yellow
if ($notes.Count -gt 0) {
    try {
        $noteId = $notes[0]._id
        $updateBody = @{
            title = "Обновленная тестовая заметка 1"
            content = "Обновленное содержимое заметки"
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$baseUrl/note/$noteId" -Method PUT -ContentType "application/json" -Body $updateBody | Out-Null
        Write-Host "✓ Заметка обновлена" -ForegroundColor Green
        
        # Проверяем обновление
        $updatedNote = Invoke-RestMethod -Uri "$baseUrl/note/$noteId" -Method GET
        Write-Host "  Новый title: $($updatedNote.title)" -ForegroundColor Gray
        Write-Host "  Новый content: $($updatedNote.content)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Ошибка: $_" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Пропущено (нет заметок)" -ForegroundColor Yellow
}
Write-Host ""

# 8. Тест ошибки - создание заметки без обязательных полей
Write-Host "[8/10] Тест ошибки - отсутствие обязательных полей..." -ForegroundColor Yellow
$invalidBody = @{
    title = "Только заголовок"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/note/" -Method POST -ContentType "application/json" -Body $invalidBody
    Write-Host "✗ Ожидалась ошибка 400" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "✓ Получена ожидаемая ошибка 400" -ForegroundColor Green
    } else {
        Write-Host "✗ Неожиданный код ошибки: $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# 9. Тест ошибки - дубликат title
Write-Host "[9/10] Тест ошибки - дубликат title..." -ForegroundColor Yellow
if ($notes.Count -gt 0) {
    $duplicateBody = @{
        title = $notes[0].title
        content = "Новое содержимое"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/note/" -Method POST -ContentType "application/json" -Body $duplicateBody
        Write-Host "✗ Ожидалась ошибка 409" -ForegroundColor Red
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "✓ Получена ожидаемая ошибка 409" -ForegroundColor Green
        } else {
            Write-Host "✗ Неожиданный код ошибки: $statusCode" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠ Пропущено (нет заметок)" -ForegroundColor Yellow
}
Write-Host ""

# 10. Удаление заметок
Write-Host "[10/10] Удаление созданных заметок..." -ForegroundColor Yellow
$deletedCount = 0
foreach ($note in $notes) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/note/$($note._id)" -Method DELETE | Out-Null
        $deletedCount++
        Write-Host "✓ Удалена заметка: $($note.title)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Ошибка при удалении $($note.title): $_" -ForegroundColor Red
    }
}
if ($deletedCount -gt 0) {
    Write-Host "  Всего удалено: $deletedCount" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Тестирование завершено!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for key press before closing
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
