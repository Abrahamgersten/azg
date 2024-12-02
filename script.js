// רישום Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const entriesContainer = document.getElementById('entries');
    const saveButton = document.getElementById('save-button');
    const currentDateElement = document.getElementById('current-date');
    const modal = document.getElementById('modal');
    const modalDate = document.getElementById('modal-date');
    const modalEntries = document.getElementById('modal-entries');
    const closeButtons = document.querySelectorAll('.close-button');

    const promptModal = document.getElementById('prompt-modal');
    const currentLevelSpan = document.getElementById('current-level');
    const addCountSpan = document.getElementById('add-count');
    const confirmAddButton = document.getElementById('confirm-add');
    const cancelAddButton = document.getElementById('cancel-add');

    const didYouKnowCarousel = document.getElementById('did-you-know-carousel');
    const categoryFilter = document.getElementById('category-filter');
    const filteredEntriesContainer = document.getElementById('filtered-entries');

    const reminderSettingsContainer = document.getElementById('reminder-settings');

    const previousThanksModal = document.getElementById('previous-thanks-modal');
    const reminderModal = document.getElementById('reminder-modal');
    const allDidYouKnowModal = document.getElementById('all-did-you-know-modal');
    const allDidYouKnowList = document.getElementById('all-did-you-know-list');

    const viewPreviousThanksLink = document.getElementById('view-previous-thanks');
    const setRemindersLink = document.getElementById('set-reminders');
    const viewAllDidYouKnowLink = document.getElementById('view-all-did-you-know');

    // קטעי הידעת (20 קטעים)
    const didYouKnowFacts = [
        "מחקרו של רוברט אמונס מצא כי הכרת תודה יכולה לשפר את הבריאות הנפשית ולהפחית תחושות דיכאון.",
        "מרטין סליגמן הראה שכתיבת 3 דברים טובים בכל יום מגבירה את האושר הכללי.",
        "מחקר גילה כי הבעת תודה כלפי בן זוג מחזקת את הקשר הרגשי ומגדילה את שביעות הרצון מהזוגיות.",
        "אנשים שמתרגלים הכרת תודה נוטים לדווח על בריאות פיזית טובה יותר ורמות מתח נמוכות יותר.",
        "תרגול של הכרת תודה מגביר את תחושת המשמעות בחיים ומסייע בהתמודדות עם אתגרים.",
        "הכרת תודה יכולה לשפר את איכות השינה שלך ולהגביר את האנרגיה היומית.",
        "מחקרים מראים שהבעת תודה מגבירה את האמפתיה ומפחיתה אגרסיביות.",
        "תרגול תודה מחזק את המערכת החיסונית ועשוי להוריד לחץ דם.",
        "אנשים שמביעים תודה הם בעלי סיכוי גבוה יותר להתנהגויות פרו-חברתיות.",
        "הכרת תודה מסייעת בפיתוח עמידות נפשית ומסייעת להתאושש מאירועים טראומטיים.",
        "כתיבת יומן תודות יכולה לשפר את המודעות העצמית והרגשות החיוביים.",
        "הכרת תודה משפרת מערכות יחסים חברתיות ומגבירה תחושת שייכות.",
        "תרגול יומי של תודה מגביר את שביעות הרצון מהחיים.",
        "הבעת תודה בעבודה יכולה להגדיל את הפרודוקטיביות ואת שביעות הרצון של העובדים.",
        "הכרת תודה יכולה להפחית רגשות קנאה ולקדם נדיבות.",
        "מחקר הראה שאנשים שמתרגלים תודה נוטים להיות פחות חומרניים.",
        "הכרת תודה משפרת את הבריאות הקרדיווסקולרית על ידי הפחתת סטרס.",
        "אנשים שמודים באופן קבוע חווים פחות כאבים כרוניים.",
        "תרגול תודה משפר את היכולת לקבל החלטות מושכלות.",
        "הכרת תודה מגבירה את התחושה של אופטימיות ותקווה לעתיד."
    ];

    // מפתח התאריך לשימוש ב-LocalStorage
    const today = new Date();
    const dateKey = today.toLocaleDateString('he-IL');

    // רמות התודות המקסימליות
    const levels = [
        { max: 5, next: 10, add: 5 },
        { max: 10, next: 15, add: 5 },
        { max: 15, next: 20, add: 5 },
        { max: 20, next: 26, add: 6 },
        { max: 26, next: null, add: 0 }
    ];

    let currentLevel = 5;

    // יצירת שדות קלט בהתאם לרמה
    function createInputFields(level) {
        const savedEntries = JSON.parse(localStorage.getItem(dateKey)) || [];
        entriesContainer.innerHTML = '';
        for (let i = 0; i < level; i++) {
            const entryContainer = document.createElement('div');
            entryContainer.className = 'entry-container';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'entry-input';
            input.placeholder = `תודה ${i + 1}`;
            input.value = savedEntries[i] ? savedEntries[i].text : '';
            entryContainer.appendChild(input);

            const selectWrapper = document.createElement('div');
            selectWrapper.className = 'styled-select';

            const select = document.createElement('select');
            select.className = 'category-select';
            const categories = [
                'דבר טוב שקרה לי היום',
                'דבר טוב שעשיתי היום',
                'תודה על דברים קטנים בחיים',
                'תודה על דברים גדולים ומשמעותיים בחיים',
                'תודה על דברים קשים',
                'תודה על דברים מהשגרה היומית'
            ];
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'בחר קטגוריה';
            defaultOption.disabled = true;
            defaultOption.selected = !savedEntries[i];
            select.appendChild(defaultOption);
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                if (savedEntries[i] && savedEntries[i].category === cat) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            selectWrapper.appendChild(select);
            entryContainer.appendChild(selectWrapper);

            entriesContainer.appendChild(entryContainer);
        }
    }

    // שמירת תודות
    function saveEntries() {
        try {
            const entryContainers = entriesContainer.getElementsByClassName('entry-container');
            const entries = Array.from(entryContainers).map(container => {
                const text = container.querySelector('.entry-input').value.trim();
                const category = container.querySelector('.category-select').value;
                return text || category ? { text, category } : null;
            });

            // שמירת כל התודות, גם אם חלק מהשדות ריקים
            localStorage.setItem(dateKey, JSON.stringify(entries));

            checkAndPrompt(entries.filter(entry => entry && entry.text).length);
            alert('התודות נשמרו בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת התודות:', error);
            alert('אירעה שגיאה בעת שמירת התודות. אנא נסה שוב.');
        }
    }

    // טעינת ימים קודמים
    function loadPreviousDays() {
        const previousDaysContainer = document.getElementById('previous-days');
        previousDaysContainer.innerHTML = '';
        const dates = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== dateKey && isValidDate(key)) {
                dates.push(key);
            }
        }
        dates.sort((a, b) => new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-')));
        dates.forEach(date => {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-entry';
            dayDiv.textContent = date;
            dayDiv.addEventListener('click', () => showEntries(date));
            previousDaysContainer.appendChild(dayDiv);
        });
    }

    // בדיקה אם מחרוזת היא תאריך חוקי
    function isValidDate(dateString) {
        const dateParts = dateString.split('.');
        if (dateParts.length !== 3) return false;
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        return !isNaN(date.getTime());
    }

    // הצגת תודות בחלון מודאל
    function showEntries(date) {
        try {
            const entries = JSON.parse(localStorage.getItem(date));
            if (!entries) throw new Error('אין נתונים עבור התאריך הזה.');
            modalDate.textContent = date;
            modalEntries.innerHTML = '';
            entries.forEach((entry, index) => {
                if (entry && entry.text) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>תודה ${index + 1}:</strong> ${entry.text} <em>(${entry.category || 'ללא קטגוריה'})</em>`;
                    modalEntries.appendChild(li);
                }
            });
            modal.style.display = 'flex';

            // הוספת מצב להיסטוריה
            history.pushState({ modalOpen: true }, null, '');
        } catch (error) {
            console.error('שגיאה בטעינת התודות:', error);
            alert('אירעה שגיאה בעת טעינת התודות. אנא נסה שוב.');
        }
    }

    // טיפול באירוע popstate כדי לסגור את המודאל
    window.addEventListener('popstate', (event) => {
        closeAllModals();
    });

    // סגירת כל המודאלים
    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }

    // עדכון כפתורי הסגירה להשתמש בפונקציה החדשה
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
            history.back();
        });
    });

    // סגירת המודאל בלחיצה מחוץ לתוכן
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
            history.back();
        }
    });

    // יצירת קטע הידעת
    function displayDidYouKnow() {
        didYouKnowCarousel.innerHTML = '';
        const dayIndex = today.getDate() % didYouKnowFacts.length;
        const factElement = document.createElement('div');
        factElement.className = 'carousel-item';
        factElement.textContent = didYouKnowFacts[dayIndex];
        didYouKnowCarousel.appendChild(factElement);
    }

    // הצגת כל קטעי "הידעת?"
    function displayAllDidYouKnow() {
        allDidYouKnowList.innerHTML = '';
        didYouKnowFacts.forEach((fact, index) => {
            const li = document.createElement('li');
            li.textContent = fact;
            allDidYouKnowList.appendChild(li);
        });
        allDidYouKnowModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
    }

    // בדיקה והצגת הודעות להוספת תודות
    function checkAndPrompt(currentFilledCount) {
        const level = levels.find(l => l.max === currentLevel);
        if (currentFilledCount >= currentLevel && level && level.next) {
            currentLevelSpan.textContent = currentLevel;
            addCountSpan.textContent = level.add;
            promptModal.style.display = 'flex';
            history.pushState({ modalOpen: true }, null, '');
        }
    }

    // טיפול באירועי המודאל להוספת תודות
    confirmAddButton.addEventListener('click', () => {
        const level = levels.find(l => l.max === currentLevel);
        if (level && level.next) {
            currentLevel = level.next;
            createInputFields(currentLevel);
        }
        promptModal.style.display = 'none';
        history.back();
    });

    cancelAddButton.addEventListener('click', () => {
        promptModal.style.display = 'none';
        history.back();
    });

    // הצגת היום בשבוע והתאריך העברי
    function displayCurrentDate() {
        const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const dayOfWeek = `היום יום ${daysOfWeek[today.getDay()]}`;
        fetchHebrewDate().then(hebrewDate => {
            currentDateElement.textContent = `${dayOfWeek}: ${hebrewDate}`;
        }).catch(error => {
            currentDateElement.textContent = dayOfWeek;
        });
    }

    // טעינת התאריך העברי
    function fetchHebrewDate() {
        return new Promise((resolve, reject) => {
            const apiUrl = `https://www.hebcal.com/converter?cfg=json&gy=${today.getFullYear()}&gm=${today.getMonth() + 1}&gd=${today.getDate()}&g2h=1`;
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    resolve(data.hebrew);
                })
                .catch(error => {
                    console.error('שגיאה בטעינת התאריך העברי:', error);
                    reject(error);
                });
        });
    }

    // טיפול בסינון לפי קטגוריה
    categoryFilter.addEventListener('change', applyCategoryFilter);

    function applyCategoryFilter() {
        const selectedCategory = categoryFilter.value;
        filteredEntriesContainer.innerHTML = '';

        if (selectedCategory === 'הכל') {
            filteredEntriesContainer.innerHTML = '';
            return;
        }

        const allEntries = [];
        if (selectedCategory === 'תודות שכתבתי היום') {
            // הבאת התודות מהיום הנוכחי
            const entries = JSON.parse(localStorage.getItem(dateKey)) || [];
            entries.forEach(entry => {
                if (entry && entry.text) {
                    allEntries.push({ date: dateKey, text: entry.text });
                }
            });
        } else {
            // הבאת התודות לפי הקטגוריה שנבחרה
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (isValidDate(key)) {
                    const entries = JSON.parse(localStorage.getItem(key));
                    entries.forEach(entry => {
                        if (entry && entry.category === selectedCategory) {
                            allEntries.push({ date: key, text: entry.text });
                        }
                    });
                }
            }
        }

        if (allEntries.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'לא נמצאו תודות בקטגוריה זו.';
            filteredEntriesContainer.appendChild(li);
        } else {
            allEntries.forEach(entry => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${entry.date}:</strong> ${entry.text}`;
                filteredEntriesContainer.appendChild(li);
            });
        }
    }

    // אתחול האפליקציה
    function initializeApp() {
        displayCurrentDate();
        const savedEntries = JSON.parse(localStorage.getItem(dateKey)) || [];

        // שחזור הרמה הקודמת או התחלה ברמה 5
        if (savedEntries.length > 0) {
            if (savedEntries.length >= 26) {
                currentLevel = 26;
            } else if (savedEntries.length >= 20) {
                currentLevel = 20;
            } else if (savedEntries.length >= 15) {
                currentLevel = 15;
            } else if (savedEntries.length >= 10) {
                currentLevel = 10;
            } else {
                currentLevel = 5;
            }
        } else {
            currentLevel = 5;
        }
        createInputFields(currentLevel);
        displayDidYouKnow();
        applyCategoryFilter();
        initializeReminders(); // אתחול התזכורות
    }

    initializeApp();
    saveButton.addEventListener('click', saveEntries);

    // הגדרת ממשק התזכורות
    function setupReminderSettings() {
        if (!('Notification' in window && navigator.serviceWorker)) {
            return;
        }

        const savedReminders = JSON.parse(localStorage.getItem('reminders')) || [];

        reminderSettingsContainer.innerHTML = '';

        const instructions = document.createElement('p');
        instructions.textContent = 'בחר את הזמנים שבהם תרצה לקבל תזכורות לכתיבת התודות שלך.';
        reminderSettingsContainer.appendChild(instructions);

        const reminderTimesContainer = document.createElement('div');
        reminderTimesContainer.id = 'reminder-times-container';
        reminderSettingsContainer.appendChild(reminderTimesContainer);

        function addReminderInput(time = '') {
            const reminderDiv = document.createElement('div');
            reminderDiv.className = 'reminder-time-input';

            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.value = time;
            reminderDiv.appendChild(timeInput);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'הסר';
            removeButton.className = 'remove-reminder-button';
            removeButton.addEventListener('click', () => {
                reminderDiv.remove();
            });
            reminderDiv.appendChild(removeButton);

            reminderTimesContainer.appendChild(reminderDiv);
        }

        savedReminders.forEach(time => {
            addReminderInput(time);
        });

        const addButton = document.createElement('button');
        addButton.textContent = 'הוסף תזכורת';
        addButton.className = 'add-reminder-button';
        addButton.addEventListener('click', () => {
            if (reminderTimesContainer.children.length < 4) {
                addReminderInput();
            } else {
                alert('ניתן להוסיף עד 4 תזכורות בלבד.');
            }
        });
        reminderSettingsContainer.appendChild(addButton);

        const saveRemindersButton = document.createElement('button');
        saveRemindersButton.textContent = 'שמור תזכורות';
        saveRemindersButton.className = 'primary-button';
        saveRemindersButton.addEventListener('click', saveReminders);
        reminderSettingsContainer.appendChild(saveRemindersButton);
    }

    // בקשת הרשאה להתראות
    function requestNotificationPermission() {
        if (Notification.permission === 'default') {
            return Notification.requestPermission();
        }
        return Promise.resolve(Notification.permission);
    }

    // שמירת התזכורות
    function saveReminders() {
        requestNotificationPermission().then(permission => {
            if (permission !== 'granted') {
                alert('לא ניתנה הרשאה לשליחת תזכורות.');
                return;
            }

            const times = Array.from(document.querySelectorAll('.reminder-time-input input[type="time"]'))
                .map(input => input.value)
                .filter(time => time);

            if (times.length === 0) {
                alert('אנא הוסף לפחות תזכורת אחת.');
                return;
            }

            localStorage.setItem('reminders', JSON.stringify(times));
            alert('התזכורות נשמרו בהצלחה!');

            // תזמון התזכורות
            times.forEach(time => {
                scheduleNotification(time);
            });
        });
    }

    // תזמון התראות
    function scheduleNotification(time) {
        const [hour, minute] = time.split(':').map(Number);
        const now = new Date();
        let notificationTime = new Date();
        notificationTime.setHours(hour, minute, 0, 0);

        // אם השעה עברה, תזמן למחר
        if (notificationTime <= now) {
            notificationTime.setDate(notificationTime.getDate() + 1);
        }

        const delay = notificationTime.getTime() - now.getTime();

        setTimeout(() => {
            if (Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('תזכורת: הודית כבר היום?', {
                        body: 'אל תשכח לכתוב את התודות שלך להיום!',
                        icon: './icon-192x192.png',
                        tag: `daily-reminder-${time}`,
                    });
                });
            }

            // תזמון חוזר למחר
            scheduleNotification(time);
        }, delay);
    }

    // אתחול תזכורות בעת טעינת הדף
    function initializeReminders() {
        if (Notification.permission !== 'granted') {
            return;
        }

        const savedReminders = JSON.parse(localStorage.getItem('reminders')) || [];
        savedReminders.forEach(time => {
            scheduleNotification(time);
        });
    }

    // טיפול בלחיצות בתפריט
    viewPreviousThanksLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadPreviousDays();
        previousThanksModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
    });

    setRemindersLink.addEventListener('click', (e) => {
        e.preventDefault();
        setupReminderSettings();
        reminderModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
    });

    viewAllDidYouKnowLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayAllDidYouKnow();
    });
});
