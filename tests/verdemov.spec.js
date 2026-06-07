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
});
