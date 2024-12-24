// Обновление курса раз в день
async function updateRate() {
    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();
        const rate = data.Valute.KZT.Value / data.Valute.KZT.Nominal;
        await chrome.storage.local.set({ exchangeRate: rate });
    } catch (error) {
    }
}

// Запускаем обновление курса
updateRate();

// Устанавливаем ежедневное обновление
chrome.alarms.create('updateRate', { periodInMinutes: 1440 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateRate') {
        updateRate();
    }
});
