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
    // אלמנטים קיימים לתודות
    // --------------------------------------------------------------------------------
    const entriesContainer = document.getElementById('entries');
    const saveButton = document.getElementById('save-button');
    const currentDateElement = document.getElementById('current-date');

    // מודאלים ותפריט
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
    const menuButton = document.querySelector('.menu-button');
    const dropdownContent = document.querySelector('.dropdown-content');

    // כפתורי תפריט
    const viewPreviousThanksLink = document.getElementById('view-previous-thanks');
    const viewAllDidYouKnowLink = document.getElementById('view-all-did-you-know');
    const viewBeliefsLink = document.getElementById('view-beliefs');
    const downloadThanksWordMenu = document.getElementById('download-thanks-word');
    const downloadAllBeliefsMenu = document.getElementById('download-all-beliefs');

    // הידעת
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

    // תאריך
    const today = new Date();
    const dateKey = today.toLocaleDateString('he-IL');

    // רמות התודות
    const levels = [
        { max: 5, next: 10, add: 5 },
        { max: 10, next: 15, add: 5 },
        { max: 15, next: 20, add: 5 },
        { max: 20, next: 26, add: 6 },
        { max: 26, next: null, add: 0 }
    ];
    let currentLevel = 5;

    // -------------------------------------------------------------------------
    // תודות
    // -------------------------------------------------------------------------
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

    function isValidDate(dateString) {
        const dateParts = dateString.split('.');
        if (dateParts.length !== 3) return false;
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
        return !isNaN(date.getTime());
    }

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
    // תאריך עברי
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
    // סינון תודות (כולל אמונות)
    // -------------------------------------------------------------------------
    categoryFilter.addEventListener('change', applyCategoryFilter);
    function applyCategoryFilter() {
        const selectedCategory = categoryFilter.value;
        filteredEntriesContainer.innerHTML = '';

        // אם המשתמש בחר "אמונות" נציג את האמונות בגודל גדול, בגלילה אופקית
        if (selectedCategory === 'אמונות') {
            const beliefs = JSON.parse(localStorage.getItem('beliefs')) || [];
            if (!beliefs.length) {
                const li = document.createElement('li');
                li.textContent = 'לא נמצאו אמונות.';
                filteredEntriesContainer.appendChild(li);
            } else {
                beliefs.forEach((belief) => {
                    const li = document.createElement('li');
                    // נשתמש בסגנון גדול יותר
                    li.style.fontSize = '1.3em';
                    li.style.fontWeight = '600';
                    li.style.padding = '15px';
                    li.style.marginBottom = '15px';
                    li.style.background = 'rgba(255, 255, 255, 0.9)';
                    li.style.borderRadius = '8px';
                    li.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    li.textContent = belief.content;
                    filteredEntriesContainer.appendChild(li);
                });
            }
            return;
        }

        // אחרת, הסינון פועל על התודות
        if (selectedCategory === 'הכל') {
            filteredEntriesContainer.innerHTML = '';
            return;
        }

        const allEntries = [];
        if (selectedCategory === 'תודות שכתבתי היום') {
            const entries = JSON.parse(localStorage.getItem(dateKey)) || [];
            entries.forEach(entry => {
                if (entry && entry.text) {
                    allEntries.push({
                        date: dateKey,
                        text: entry.text,
                        category: entry.category || ''
                    });
                }
            });
        } else {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (isValidDate(key)) {
                    const entries = JSON.parse(localStorage.getItem(key));
                    entries.forEach(entry => {
                        if (entry && entry.category === selectedCategory) {
                            allEntries.push({
                                date: key,
                                text: entry.text,
                                category: entry.category || ''
                            });
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

    viewBeliefsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openBeliefsModal();
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
                    docContent += "\n"; // רווח של 2 שורות
                }
            });

            if (index < allKeys.length - 1) {
                docContent += "\f"; // form feed
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
    // אמונות (טבע = נס)
    // -------------------------------------------------------------------------
    const beliefsModal = document.getElementById('beliefs-modal');
    const newBeliefContent = document.getElementById('new-belief-content');
    const saveNewBeliefBtn = document.getElementById('save-new-belief');
    const beliefsList = document.getElementById('beliefs-list');

    function openBeliefsModal() {
        beliefsModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
        newBeliefContent.value = '';
        displayBeliefsList();
    }

    saveNewBeliefBtn.addEventListener('click', () => {
        const content = newBeliefContent.value.trim();
        if (!content) {
            alert('אין מה לשמור.');
            return;
        }
        const beliefs = JSON.parse(localStorage.getItem('beliefs')) || [];
        beliefs.push({ content });
        localStorage.setItem('beliefs', JSON.stringify(beliefs));
        alert('האמונה נשמרה בהצלחה!');
        newBeliefContent.value = '';
        displayBeliefsList();
    });

    function displayBeliefsList() {
        beliefsList.innerHTML = '';
        const beliefs = JSON.parse(localStorage.getItem('beliefs')) || [];
        if (!beliefs.length) {
            beliefsList.innerHTML = '<p>עדיין לא נכתבו אמונות.</p>';
            return;
        }
        // יצירת גלריית אמונות אופקית
        beliefs.forEach((belief, idx) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'belief-entry';

            const contentP = document.createElement('p');
            contentP.textContent = belief.content;
            contentP.style.fontSize = '1.3em';
            contentP.style.fontWeight = '600';
            entryDiv.appendChild(contentP);

            // כפתורי עריכה ומחיקה
            const buttonsDiv = document.createElement('div');
            buttonsDiv.style.marginTop = '10px';
            buttonsDiv.style.display = 'flex';
            buttonsDiv.style.gap = '10px';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'ערוך';
            editBtn.className = 'secondary-button';
            editBtn.style.fontSize = '12px';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'מחק';
            deleteBtn.className = 'secondary-button';
            deleteBtn.style.fontSize = '12px';

            editBtn.addEventListener('click', () => {
                editBelief(idx);
            });

            deleteBtn.addEventListener('click', () => {
                if (confirm('האם למחוק אמונה זו?')) {
                    beliefs.splice(idx, 1);
                    localStorage.setItem('beliefs', JSON.stringify(beliefs));
                    displayBeliefsList();
                }
            });

            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);
            entryDiv.appendChild(buttonsDiv);

            beliefsList.appendChild(entryDiv);
        });
    }

    function editBelief(index) {
        const beliefs = JSON.parse(localStorage.getItem('beliefs')) || [];
        const belief = beliefs[index];
        if (!belief) return;

        const newContent = prompt('ערוך את האמונה:', belief.content);
        if (newContent === null) return;

        belief.content = newContent.trim();
        localStorage.setItem('beliefs', JSON.stringify(beliefs));

        alert('האמונה נערכה בהצלחה!');
        displayBeliefsList();
    }

    // הורדת אמונות כ-Word
    downloadAllBeliefsMenu?.addEventListener('click', (e) => {
        e.preventDefault();
        downloadAllBeliefsAsWord();
    });

    function downloadAllBeliefsAsWord() {
        const beliefs = JSON.parse(localStorage.getItem('beliefs')) || [];
        if (!beliefs.length) {
            alert('לא נמצאו אמונות להורדה.');
            return;
        }

        let docContent = '';
        docContent += `@font-face {\n`;
        docContent += `  font-family: "Rubik";\n`;
        docContent += `}\n\n`;
        docContent += `כל האמונות:\n\n`;

        beliefs.forEach((item, idx) => {
            docContent += `אמונה ${idx + 1}:\n${item.content}\n\n`;
            docContent += "\n"; // 2 שורות רווח
        });

        const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'אמונות.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
});
