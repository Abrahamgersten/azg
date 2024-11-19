document.addEventListener('DOMContentLoaded', function () {
    const entriesContainer = document.getElementById('entries');
    const saveButton = document.getElementById('save-button');
    const currentDateElement = document.getElementById('current-date');
    const previousDaysContainer = document.getElementById('previous-days');
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

    // קטעי הידעת
    const didYouKnowFacts = [
        "מחקרו של רוברט אמונס מצא כי הכרת תודה יכולה לשפר את הבריאות הנפשית ולהפחית תחושות דיכאון.",
        "מרטין סליגמן הראה שכתיבת 3 דברים טובים בכל יום מגבירה את האושר הכללי.",
        "מחקר גילה כי הבעת תודה כלפי בן זוג מחזקת את הקשר הרגשי ומגדילה את שביעות הרצון מהזוגיות.",
        "אנשים שמתרגלים הכרת תודה נוטים לדווח על בריאות פיזית טובה יותר ורמות מתח נמוכות יותר.",
        "תרגול של הכרת תודה מגביר את תחושת המשמעות בחיים ומסייע בהתמודדות עם אתגרים."
    ];

    // מפתח התאריך לשימוש ב-LocalStorage
    const today = new Date();
    const dateKey = today.toLocaleDateString('he-IL');

    // רמות ההודיות המקסימליות
    const levels = [
        { max: 5, next: 10, add: 5 },
        { max: 10, next: 26, add: 16 },
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
            input.placeholder = `הודיה ${i + 1}`;
            input.value = savedEntries[i] ? savedEntries[i].text : '';
            entryContainer.appendChild(input);

            const select = document.createElement('select');
            select.className = 'category-select';
            const categories = [
                'הודיה על דברים קטנים בחיים',
                'הודיה על דברים גדולים ומשמעותיים בחיים',
                'הודיה על דברים קשים',
                'הודיה על דברים מהשגרה היומית'
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
            entryContainer.appendChild(select);

            entriesContainer.appendChild(entryContainer);
        }
    }

    // שמירת הודיות
    function saveEntries() {
        try {
            const entryContainers = entriesContainer.getElementsByClassName('entry-container');
            const entries = Array.from(entryContainers).map(container => {
                const text = container.querySelector('.entry-input').value.trim();
                const category = container.querySelector('.category-select').value;
                return text ? { text, category } : null;
            }).filter(entry => entry !== null);
            localStorage.setItem(dateKey, JSON.stringify(entries));
            loadPreviousDays();
            checkAndPrompt(entries.length);
            alert('ההודיות נשמרו בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת ההודיות:', error);
            alert('אירעה שגיאה בעת שמירת ההודיות. אנא נסה שוב.');
        }
    }

    // טעינת ימים קודמים
    function loadPreviousDays() {
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

    // הצגת הודיות בחלון מודאל
    function showEntries(date) {
        try {
            const entries = JSON.parse(localStorage.getItem(date));
            if (!entries) throw new Error('אין נתונים עבור התאריך הזה.');
            modalDate.textContent = date;
            modalEntries.innerHTML = '';
            entries.forEach((entry, index) => {
                if (entry) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>הודיה ${index + 1}:</strong> ${entry.text} <em>(${entry.category || 'ללא קטגוריה'})</em>`;
                    modalEntries.appendChild(li);
                }
            });
            modal.style.display = 'flex';

            // Push state to history to handle back button
            history.pushState({ modalOpen: true }, '', '');
        } catch (error) {
            console.error('שגיאה בטעינת ההודיות:', error);
            alert('אירעה שגיאה בעת טעינת ההודיות. אנא נסה שוב.');
        }
    }

    // Handle back button to close modal instead of exiting app
    window.addEventListener('popstate', (event) => {
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    // יצירת קטע הידעת
    function createDidYouKnowCarousel(facts) {
        didYouKnowCarousel.innerHTML = '';
        facts.forEach((fact) => {
            const factElement = document.createElement('div');
            factElement.className = 'carousel-item';
            factElement.textContent = fact;
            didYouKnowCarousel.appendChild(factElement);
        });
    }

    // בדיקה והצגת הודעות להוספת הודיות
    function checkAndPrompt(currentCount) {
        const level = levels.find(l => l.max === currentLevel);
        if (currentCount === currentLevel && level && level.next) {
            currentLevelSpan.textContent = currentLevel;
            addCountSpan.textContent = level.add;
            promptModal.style.display = 'flex';
        }
    }

    // טיפול באירועי המודאל להוספת הודיות
    confirmAddButton.addEventListener('click', () => {
        const level = levels.find(l => l.max === currentLevel);
        if (level && level.next) {
            currentLevel = level.next;
            createInputFields(currentLevel);
        }
        promptModal.style.display = 'none';
    });

    cancelAddButton.addEventListener('click', () => {
        promptModal.style.display = 'none';
    });

    // סגירת מודאלים בלחיצה על כפתורים
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';

            // Adjust history when modal is closed
            if (modal.style.display === 'none') {
                history.back();
            }
        });
    });

    // סגירת המודאל בלחיצה מחוץ לתוכן
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';

            // Adjust history when modal is closed
            history.back();
        }
        if (event.target === promptModal) {
            promptModal.style.display = 'none';
        }
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

    // אתחול האפליקציה
    function initializeApp() {
        displayCurrentDate();
        const savedEntries = JSON.parse(localStorage.getItem(dateKey)) || [];
        const lastSavedDate = localStorage.getItem('lastSavedDate');
        if (lastSavedDate !== dateKey) {
            localStorage.setItem('lastSavedDate', dateKey);
            // ניקוי השדות ליום חדש
            currentLevel = 5;
            createInputFields(currentLevel);
        } else {
            // שחזור הרמה הקודמת
            if (savedEntries.length >= 26) {
                currentLevel = 26;
            } else if (savedEntries.length >= 10) {
                currentLevel = 10;
            } else {
                currentLevel = 5;
            }
            createInputFields(currentLevel);
        }
        loadPreviousDays();
        createDidYouKnowCarousel(didYouKnowFacts);
        applyCategoryFilter();
    }

    // טיפול בסינון לפי קטגוריה
    categoryFilter.addEventListener('change', applyCategoryFilter);

    function applyCategoryFilter() {
        const selectedCategory = categoryFilter.value;
        filteredEntriesContainer.innerHTML = '';
        if (selectedCategory === 'הכל') {
            return;
        }
        const allEntries = [];
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
        if (allEntries.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'לא נמצאו הודיות בקטגוריה זו.';
            filteredEntriesContainer.appendChild(li);
        } else {
            allEntries.sort((a, b) => new Date(b.date.split('.').reverse().join('-')) - new Date(a.date.split('.').reverse().join('-')));
            allEntries.forEach(entry => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${entry.date}:</strong> ${entry.text}`;
                filteredEntriesContainer.appendChild(li);
            });
        }
    }

    initializeApp();
    saveButton.addEventListener('click', saveEntries);
});
