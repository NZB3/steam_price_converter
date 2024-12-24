let currentRate = 0.1953;

// Получаем сохраненный курс при загрузке
chrome.storage.local.get('exchangeRate', (data) => {
    if (data.exchangeRate) {
        currentRate = data.exchangeRate;
    }
});

// Слушаем изменения курса
chrome.storage.onChanged.addListener((changes) => {
    if (changes.exchangeRate) {
        currentRate = changes.exchangeRate.newValue;
        updatePrices();
    }
});

function convertPrice(priceText) {
    const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.'));
    const convertedPrice = (price * currentRate).toFixed(2);
    return `${convertedPrice} ₽`;
}

function updatePrices() {
    // Используем более точные селекторы
    const priceElements = document.querySelectorAll(
        'div.game_purchase_price, ' +
        'div.discount_final_price, ' +
        'div.discount_original_price, ' +
        '#header_wallet_balance, ' + // Баланс в шапке
        '.wallet_balance' // Баланс на странице кошелька
    );

    priceElements.forEach(element => {
        if (!element.hasAttribute('data-converted')) {
            const originalPrice = element.textContent.trim();
            if (originalPrice.includes('₸')) {
                const rubPrice = convertPrice(originalPrice);
                const priceWrapper = document.createElement('span');
                priceWrapper.innerHTML = `${originalPrice} (${rubPrice})`;
                element.innerHTML = priceWrapper.innerHTML;
                element.setAttribute('data-converted', 'true');
            }
        }
    });
}

// Отложенный запуск для гарантированной загрузки цен
setTimeout(updatePrices, 1000);

// Ограничиваем частоту обновлений при наблюдении
const throttledUpdate = () => {
    if (!throttledUpdate.timeout) {
        throttledUpdate.timeout = setTimeout(() => {
            updatePrices();
            throttledUpdate.timeout = null;
        }, 1000);
    }
};

const observer = new MutationObserver(throttledUpdate);
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});
