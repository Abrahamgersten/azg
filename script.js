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
    // --------------------------------------------------------------------------------
    // אלמנטים ראשיים
    // --------------------------------------------------------------------------------
    const entriesContainer = document.getElementById('entries');
    const saveButton = document.getElementById('save-button');
    const currentDateElement = document.getElementById('current-date');

    const modal = document.getElementById('modal');
    const modalDate = document.getElementById('modal-date');
    const modalEntries = document.getElementById('modal-entries');
    const promptModal = document.getElementById('prompt-modal');
    const currentLevelSpan = document.getElementById('current-level');
    const addCountSpan = document.getElementById('add-count');
    const confirmAddButton = document.getElementById('confirm-add');
    const cancelAddButton = document.getElementById('cancel-add');
    const previousThanksModal = document.getElementById('previous-thanks-modal');
    const allDidYouKnowModal = document.getElementById('all-did-you-know-modal');
    const allDidYouKnowList = document.getElementById('all-did-you-know-list');
    const categoryFilter = document.getElementById('category-filter');
    const filteredEntriesContainer = document.getElementById('filtered-entries');

    // כפתורי תפריט
    const menuButton = document.querySelector('.menu-button');
    const dropdownContent = document.querySelector('.dropdown-content');
    const viewPreviousThanksLink = document.getElementById('view-previous-thanks');
    const viewAllDidYouKnowLink = document.getElementById('view-all-did-you-know');
    const viewInsightsLink = document.getElementById('view-insights');
    const downloadThanksWordMenu = document.getElementById('download-thanks-word');
    const downloadAllInsightsMenu = document.getElementById('download-all-insights');

    // ידעת?
    const didYouKnowCarousel = document.getElementById('did-you-know-carousel');
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

    // הגדרות רמות תודות
    const levels = [
        { max: 5, next: 10, add: 5 },
        { max: 10, next: 15, add: 5 },
        { max: 15, next: 20, add: 5 },
        { max: 20, next: 26, add: 6 },
        { max: 26, next: null, add: 0 }
    ];
    let currentLevel = 5;

    // תאריך היום
    const today = new Date();
    const dateKey = today.toLocaleDateString('he-IL');

    // -------------------------------------------------------------------------
    // יצירת שדות תודות
    // -------------------------------------------------------------------------
    function createInputFields(level) {
        const savedEntries = JSON.parse(localStorage.getItem(dateKey)) || [];
        entriesContainer.innerHTML = '';
        for (let i = 0; i < level; i++) {
            const entryContainer = document.createElement('div');
            entryContainer.className = 'entry-container';

            // אינפוט לטקסט התודה
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'entry-input';
            input.placeholder = `תודה ${i + 1}`;
            input.value = savedEntries[i] ? savedEntries[i].text : '';
            entryContainer.appendChild(input);

            // select לקטגוריה
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
            localStorage.setItem(dateKey, JSON.stringify(entries));

            checkAndPrompt(entries.filter(entry => entry && entry.text).length);
            alert('התודות נשמרו בהצלחה!');
        } catch (error) {
            console.error('שגיאה בשמירת התודות:', error);
            alert('אירעה שגיאה בעת שמירת התודות. אנא נסה שוב.');
        }
    }

    // טענת תודות מימים קודמים
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

    // בדיקת תוקף תאריך
    function isValidDate(dateString) {
        const dateParts = dateString.split('.');
        if (dateParts.length !== 3) return false;
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        return !isNaN(date.getTime());
    }

    // הצגת תודות (מימים קודמים) במודאל
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
            history.pushState({ modalOpen: true }, null, '');
        } catch (error) {
            console.error('שגיאה בטעינת התודות:', error);
            alert('אירעה שגיאה בעת טעינת התודות. אנא נסה שוב.');
        }
    }

    // -------------------------------------------------------------------------
    // הידעת
    // -------------------------------------------------------------------------
    function displayDidYouKnow() {
        didYouKnowCarousel.innerHTML = '';
        const dayIndex = today.getDate() % didYouKnowFacts.length;
        const factElement = document.createElement('div');
        factElement.className = 'carousel-item';
        factElement.textContent = didYouKnowFacts[dayIndex];
        didYouKnowCarousel.appendChild(factElement);
    }

    function displayAllDidYouKnow() {
        allDidYouKnowList.innerHTML = '';
        didYouKnowFacts.forEach((fact) => {
            const li = document.createElement('li');
            li.textContent = fact;
            allDidYouKnowList.appendChild(li);
        });
        allDidYouKnowModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
    }

    // -------------------------------------------------------------------------
    // רמת התודות
    // -------------------------------------------------------------------------
    function checkAndPrompt(currentFilledCount) {
        const level = levels.find(l => l.max === currentLevel);
        if (currentFilledCount >= currentLevel && level && level.next) {
            currentLevelSpan.textContent = currentLevel;
            addCountSpan.textContent = level.add;
            promptModal.style.display = 'flex';
            history.pushState({ modalOpen: true }, null, '');
        }
    }

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

    // -------------------------------------------------------------------------
    // מודאלים והיסטוריה
    // -------------------------------------------------------------------------
    window.addEventListener('popstate', () => {
        closeAllModals();
    });

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(m => {
            if (m.style.display === 'flex') {
                m.style.display = 'none';
            }
        });
    }

    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
            history.back();
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
            history.back();
        }
    });

    // -------------------------------------------------------------------------
    // הצגת תאריך (היום + תאריך עברי)
    // -------------------------------------------------------------------------
    function displayCurrentDate() {
        const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
        const dayOfWeek = `היום יום ${daysOfWeek[today.getDay()]}`;
        fetchHebrewDate().then(hebrewDate => {
            currentDateElement.textContent = `${dayOfWeek}: ${hebrewDate}`;
        }).catch(() => {
            currentDateElement.textContent = dayOfWeek;
        });
    }

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

    // -------------------------------------------------------------------------
    // אתחול
    // -------------------------------------------------------------------------
    function initializeApp() {
        displayCurrentDate();
        const savedEntries = JSON.parse(localStorage.getItem(dateKey)) || [];
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
    }

    initializeApp();
    saveButton.addEventListener('click', saveEntries);

    // -------------------------------------------------------------------------
    // תפריט
    // -------------------------------------------------------------------------
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
    });
    window.addEventListener('click', () => {
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        }
    });

    viewPreviousThanksLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadPreviousDays();
        previousThanksModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
    });

    viewAllDidYouKnowLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayAllDidYouKnow();
    });

    // הורדת תודות כ-Word
    downloadThanksWordMenu?.addEventListener('click', (e) => {
        e.preventDefault();
        downloadThanksAsWord();
    });

    function downloadThanksAsWord() {
        const allKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (isValidDate(k)) {
                allKeys.push(k);
            }
        }
        if (!allKeys.length) {
            alert('לא נמצאו תודות להורדה.');
            return;
        }
        allKeys.sort((a, b) => new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-')));

        let docContent = '';
        docContent += `@font-face {\n`;
        docContent += `  font-family: "Rubik";\n`;
        docContent += `}\n\n`;
        docContent += `תודות שונות שנכתבו:\n\n`;

        allKeys.forEach((key, index) => {
            const entries = JSON.parse(localStorage.getItem(key));
            docContent += `יום ${key}:\n\n`;

            entries.forEach((entry, idx) => {
                if (entry && entry.text) {
                    docContent += `${idx + 1}. ${entry.text} (קטגוריה: ${entry.category || 'ללא'})\n\n`;
                    docContent += "\n";
                }
            });
            if (index < allKeys.length - 1) {
                docContent += "\f";
            }
        });

        const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'תודות.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // -------------------------------------------------------------------------
    // ניהול האמונות (במקום תובנות)
    // -------------------------------------------------------------------------
    const insightsModal = document.getElementById('insights-modal');
    const newInsightTitle = document.getElementById('new-insight-title');
    const newInsightContent = document.getElementById('new-insight-content');
    const saveNewInsightBtn = document.getElementById('save-new-insight');
    const insightsList = document.getElementById('insights-list');

    viewInsightsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openInsightsModal();
    });

    function openInsightsModal() {
        insightsModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
        newInsightTitle.value = '';
        newInsightContent.value = '';
        displayInsightsList();
    }

    // שמירת אמונה חדשה
    saveNewInsightBtn.addEventListener('click', () => {
        const title = newInsightTitle.value.trim() || 'אמונה חדשה';
        const content = newInsightContent.value.trim();

        if (!title && !content) {
            alert('אין מה לשמור.');
            return;
        }

        const insights = JSON.parse(localStorage.getItem('insights')) || [];
        insights.push({
            title,
            content
        });
        localStorage.setItem('insights', JSON.stringify(insights));
        alert('האמונה נשמרה בהצלחה!');

        newInsightTitle.value = '';
        newInsightContent.value = '';
        displayInsightsList();
    });

    // הצגת רשימת האמונות, עם אפשרות עריכה ומחיקה
    function displayInsightsList() {
        insightsList.innerHTML = '';
        const insights = JSON.parse(localStorage.getItem('insights')) || [];
        if (!insights.length) {
            insightsList.innerHTML = '<p>עדיין לא נכתבו אמונות.</p>';
            return;
        }
        insights.forEach((insight, idx) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'insight-entry';

            // כותרת + כפתורי עריכה/מחיקה בשורה אחת
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.alignItems = 'center';
            rowDiv.style.justifyContent = 'space-between';

            const titleEl = document.createElement('strong');
            titleEl.textContent = `כותרת: ${insight.title}`;
            titleEl.style.fontSize = '1.1em';

            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '8px';

            const editBtn = document.createElement('button');
            editBtn.className = 'secondary-button';
            editBtn.textContent = 'ערוך';
            editBtn.style.fontSize = '14px';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'secondary-button';
            deleteBtn.textContent = 'מחק';
            deleteBtn.style.fontSize = '14px';

            btnContainer.appendChild(editBtn);
            btnContainer.appendChild(deleteBtn);

            rowDiv.appendChild(titleEl);
            rowDiv.appendChild(btnContainer);

            entryDiv.appendChild(rowDiv);

            // תוכן האמונה
            const contentP = document.createElement('p');
            contentP.textContent = insight.content;
            contentP.style.marginTop = '10px';
            entryDiv.appendChild(contentP);

            // אירוע מחיקה
            deleteBtn.addEventListener('click', () => {
                if (confirm('האם למחוק אמונה זו?')) {
                    insights.splice(idx, 1);
                    localStorage.setItem('insights', JSON.stringify(insights));
                    displayInsightsList();
                }
            });

            // אירוע עריכה
            editBtn.addEventListener('click', () => {
                editInsight(idx);
            });

            insightsList.appendChild(entryDiv);
        });
    }

    // עריכת אמונה קיימת
    function editInsight(index) {
        const insights = JSON.parse(localStorage.getItem('insights')) || [];
        const insightObj = insights[index];
        if (!insightObj) return;

        const newTitle = prompt('ערוך כותרת האמונה:', insightObj.title);
        if (newTitle === null) return; // ביטול

        const newContent = prompt('ערוך תוכן האמונה:', insightObj.content);
        if (newContent === null) return; // ביטול

        insightObj.title = newTitle.trim() || 'אמונה חדשה';
        insightObj.content = newContent.trim();
        localStorage.setItem('insights', JSON.stringify(insights));

        alert('האמונה נערכה בהצלחה!');
        displayInsightsList();
    }

    // הורדת אמונות כ-Word (במקום "תובנות")
    downloadAllInsightsMenu?.addEventListener('click', (e) => {
        e.preventDefault();
        downloadAllInsightsAsWord();
    });

    function downloadAllInsightsAsWord() {
        const insights = JSON.parse(localStorage.getItem('insights')) || [];
        if (!insights.length) {
            alert('לא נמצאו אמונות להורדה.');
            return;
        }

        let docContent = '';
        docContent += `@font-face {\n`;
        docContent += `  font-family: "Rubik";\n`;
        docContent += `}\n\n`;
        docContent += `כל האמונות:\n\n`;

        insights.forEach((item, idx) => {
            docContent += `אמונה ${idx + 1} - כותרת: ${item.title}\n`;
            docContent += `${item.content}\n\n`;
            docContent += "\n"; // 2 שורות רווח
        });

        const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'האמונות שלי.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
});
