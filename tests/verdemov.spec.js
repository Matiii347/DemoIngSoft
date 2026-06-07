import { test, expect } from '@playwright/test';

test.describe('VerdeMov E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the local server
    await page.goto('http://localhost:8000/react.html');
  });

  test('Operador: Navegación, Búsqueda y Detalles', async ({ page }) => {
    // 1. Fill in login credentials for Gerente
    await page.locator('input[name="username"]').fill('gerente');
    await page.locator('input[name="password"]').fill('gerente123');
    await page.locator('button:has-text("Iniciar Sesión")').click();

    // 2. Verify operator welcome header on Dashboard
    await expect(page.locator('h2:has-text("Hola, Operador")')).toBeVisible();

    // 3. Click "Flota" in Bottom Navigation Bar
    const flotaTab = page.locator('button:has-text("Flota")');
    await flotaTab.click();
    await expect(page.locator('h2:has-text("Unidades Activas")')).toBeVisible();

    // 4. Search for a truck (e.g. VM-042)
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('VM-042');
    await expect(page.locator('span:has-text("VM-042")')).toBeVisible();
    
    // VM-099 should be filtered out
    await expect(page.locator('span:has-text("VM-099")')).not.toBeVisible();

    // 5. Click VM-042 card to open Technical File (Ficha Técnica)
    await page.locator('span:has-text("VM-042")').first().click();
    await expect(page.locator('h1:has-text("Ficha Técnica de Camión")')).toBeVisible();
    await expect(page.locator('h2:has-text("VM-042")')).toBeVisible();

    // 6. Click back button to return to fleet list
    const backBtn = page.locator('button[aria-label="Volver"], button:has(.material-symbols-outlined:has-text("arrow_back"))').first();
    await backBtn.click();
    await expect(page.locator('h2:has-text("Unidades Activas")')).toBeVisible();

    // 7. Click "Alertas" in bottom nav
    const alertasTab = page.locator('button:has-text("Alertas")');
    await alertasTab.click();
    await expect(page.locator('h1:has-text("Alertas de Flota")')).toBeVisible();
  });

  test('Conductor: Panel de Batería, Hoja de Ruta e Interacciones', async ({ page }) => {
    // 1. Fill in login credentials for Chofer
    await page.locator('input[name="username"]').fill('chofer');
    await page.locator('input[name="password"]').fill('chofer123');
    await page.locator('button:has-text("Iniciar Sesión")').click();
    
    // Now role badge should display "Chofer"
    await expect(page.locator('span:has-text("Chofer")')).toBeVisible();
    
    // 2. Verify Driver Panel ( circular battery progress and documentation warnings )
    await expect(page.locator('span:has-text("Rango Estimado")')).toBeVisible();
    await expect(page.locator('h3:has-text("VTV Próxima a Vencer")')).toBeVisible();

    // 3. Navigate to Driver Route page
    const rutasTab = page.locator('button:has-text("Rutas")');
    await rutasTab.click();
    await expect(page.locator('h1:has-text("Mi Hoja de Ruta")')).toBeVisible();

    // 4. Test timeline and task checklist
    const checkbox1 = page.locator('input[type="checkbox"]').first();
    const checkbox2 = page.locator('input[type="checkbox"]').nth(1);
    
    // Siguiente state badge
    await expect(page.locator('span:has-text("Siguiente")')).toBeVisible();
    
    // Check both tasks
    await checkbox1.check();
    await checkbox2.check();
    
    // The badge should change to "Listo"
    await expect(page.locator('span:has-text("Listo")')).toBeVisible();

    // 5. Test Navigation simulation button
    const navBtn = page.locator('button:has-text("Iniciar Navegación")');
    await expect(navBtn).toBeVisible();
    await navBtn.click();
    
    // Button label should change to "Detener Navegación"
    await expect(page.locator('button:has-text("Detener Navegación")')).toBeVisible();
  });

  test('Operador: CRUD de Choferes', async ({ page }) => {
    // 1. Iniciar sesión como Gerente
    await page.locator('input[name="username"]').fill('gerente');
    await page.locator('input[name="password"]').fill('gerente123');
    await page.locator('button:has-text("Iniciar Sesión")').click();

    // 2. Navegar a la sección de Choferes
    const choferesTab = page.locator('button:has-text("Choferes")');
    await choferesTab.click();
    await expect(page.locator('h1:has-text("Gestión de Choferes")')).toBeVisible();

    // 3. Crear un nuevo chofer
    await page.locator('#btn-add-driver').click();
    await page.locator('input[name="name"]').fill('Roberto Gomez');
    await page.locator('input[name="username"]').fill('roberto');
    await page.locator('input[name="password"]').fill('roberto123');
    await page.locator('select[name="licenseStatus"]').selectOption('Vigente');
    await page.locator('#btn-submit-driver').click();

    // Verificar que aparece en el listado
    await expect(page.locator('h3:has-text("Roberto Gomez")')).toBeVisible();
    await expect(page.locator('span:has-text("@roberto")')).toBeVisible();

    // 4. Buscar y editar el chofer creado
    await page.locator('#driver-search-input').fill('roberto');
    await expect(page.locator('h3:has-text("Ana Silva")')).not.toBeVisible(); // Ana should be filtered out
    
    // Abrir edición del chofer
    await page.locator('[data-testid="btn-edit-roberto"]').click();
    await page.locator('select[name="licenseStatus"]').selectOption('Vencida');
    await page.locator('#btn-submit-driver').click();

    // Limpiar búsqueda y verificar el estado modificado
    await page.locator('#driver-search-input').fill('');
    await expect(page.locator('span:has-text("VENCIDA")')).toBeVisible();

    // 5. Probar el inicio de sesión con el nuevo chofer creado
    // Cerrar sesión del gerente
    await page.locator('button[title="Cerrar sesión"]').click();
    await expect(page.locator('button:has-text("Iniciar Sesión")')).toBeVisible();

    // Iniciar sesión con roberto
    await page.locator('input[name="username"]').fill('roberto');
    await page.locator('input[name="password"]').fill('roberto123');
    await page.locator('button:has-text("Iniciar Sesión")').click();

    // Verificar ingreso exitoso como chofer roberto
    await expect(page.locator('span:has-text("Chofer")')).toBeVisible();

    // 6. Volver a gerente y eliminar a roberto
    await page.locator('button[title="Cerrar sesión"]').click();
    await page.locator('input[name="username"]').fill('gerente');
    await page.locator('input[name="password"]').fill('gerente123');
    await page.locator('button:has-text("Iniciar Sesión")').click();

    // Ir a choferes
    await page.locator('button:has-text("Choferes")').click();

    // Simular el click en eliminar (manejando el diálogo confirm)
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-testid="btn-delete-roberto"]').click();

    // Verificar que roberto ya no está
    await expect(page.locator('h3:has-text("Roberto Gomez")')).not.toBeVisible();
  });
});
