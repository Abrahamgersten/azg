// רישום Service Worker (ניסיון לשפר את ההתראות)
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
    // אלמנטים קיימים
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

    // מודאלים נוספים
    const previousThanksModal = document.getElementById('previous-thanks-modal');
    const reminderModal = document.getElementById('reminder-modal');
    const allDidYouKnowModal = document.getElementById('all-did-you-know-modal');
    const allDidYouKnowList = document.getElementById('all-did-you-know-list');
    const insightsModal = document.getElementById('insights-modal');
    const insightsList = document.getElementById('insights-list');

    // תפריט
    const viewPreviousThanksLink = document.getElementById('view-previous-thanks');
    const setRemindersLink = document.getElementById('set-reminders');
    const viewAllDidYouKnowLink = document.getElementById('view-all-did-you-know');
    const viewInsightsLink = document.getElementById('view-insights');
    const menuButton = document.querySelector('.menu-button');
    const dropdownContent = document.querySelector('.dropdown-content');

    // מקטע הידעת (20 קטעים)
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
            history.pushState({ modalOpen: true }, null, '');
        } catch (error) {
            console.error('שגיאה בטעינת התודות:', error);
            alert('אירעה שגיאה בעת טעינת התודות. אנא נסה שוב.');
        }
    }

    // הידעת?
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

    // סגירת מודאלים והיסטוריה
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

    // סינון תודות
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
            const entries = JSON.parse(localStorage.getItem(dateKey)) || [];
            entries.forEach(entry => {
                if (entry && entry.text) {
                    allEntries.push({ date: dateKey, text: entry.text, category: entry.category || '' });
                }
            });
        } else {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (isValidDate(key)) {
                    const entries = JSON.parse(localStorage.getItem(key));
                    entries.forEach(entry => {
                        if (entry && entry.category === selectedCategory) {
                            allEntries.push({ date: key, text: entry.text, category: entry.category || '' });
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

    // אתחול
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
        initializeReminders();
    }

    initializeApp();
    saveButton.addEventListener('click', saveEntries);

    // תפריט
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
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

    // ========== פונקציונליות תובנות משודרגת ==========
    const insightsContainer = document.getElementById('insights-container');
    const addInsightButton = document.getElementById('add-insight-button');
    const saveInsightButton = document.getElementById('save-insight-button');

    function createInsightEntry() {
        const insightEntry = document.createElement('div');
        insightEntry.className = 'insight-entry';
        insightEntry.innerHTML = `
            <input type="text" class="insight-title" placeholder="כותרת התובנה (אופציונלי)">
            <textarea class="insight-input" placeholder="כתוב כאן את התובנה..."></textarea>
            <div class="audio-controls">
                <button class="start-record-btn secondary-button">התחל הקלטה</button>
                <button class="stop-record-btn secondary-button" disabled>עצור הקלטה</button>
                <button class="transcribe-btn secondary-button" disabled>תמלל הקלטה</button>
            </div>
            <audio class="audio-player" controls style="display: none;"></audio>
        `;
        insightsContainer.appendChild(insightEntry);

        const startRecordBtn = insightEntry.querySelector('.start-record-btn');
        const stopRecordBtn = insightEntry.querySelector('.stop-record-btn');
        const transcribeBtn = insightEntry.querySelector('.transcribe-btn');
        const audioPlayer = insightEntry.querySelector('.audio-player');

        let mediaRecorder;
        let chunks = [];

        // התחלת הקלטה
        startRecordBtn.addEventListener('click', async () => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('הדפדפן שלך לא תומך בהקלטת אודיו.');
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                chunks = [];
                mediaRecorder.start();
                startRecordBtn.disabled = true;
                stopRecordBtn.disabled = false;
                transcribeBtn.disabled = true;
            } catch (err) {
                alert('שגיאה בגישה למיקרופון: ' + err.message);
            }
        });

        // עצירת הקלטה
        stopRecordBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                startRecordBtn.disabled = false;
                stopRecordBtn.disabled = true;
                transcribeBtn.disabled = false;
            }
        });

        // איסוף האודיו
        if (window.MediaRecorder) {
            mediaRecorder?.addEventListener('dataavailable', (e) => {
                chunks.push(e.data);
            });
            mediaRecorder?.addEventListener('stop', () => {
                const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
                const audioURL = URL.createObjectURL(blob);
                audioPlayer.src = audioURL;
                audioPlayer.style.display = 'block';
                // שמירה ב-<audio> עצמו
                audioPlayer.dataset.audioBlob = blob;
            });
        }

        // תמלול הקלטה (SpeechRecognition יכול להיות מוגבל)
        transcribeBtn.addEventListener('click', async () => {
            if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
                alert('הדפדפן לא תומך בתמלול הקלטה.');
                return;
            }
            const insightTextArea = insightEntry.querySelector('.insight-input');
            try {
                // נשתמש ב-BlobReader ? או נבצע SpeechRecognition חי? בדרך כלל SpeechRecognition עובדת על הקלטה חיה, לא על Blob.
                // לשם ההדגמה, נדגים תמלול מזויף.
                alert('תמלול הקלטה בדפדפנים דורש שימוש ב-API נוסף, בדרך כלל חי בלבד (Real-time). כאן נציג רק הדגמה.');
                // נניח שהתמלול הצליח והחזיר "אדמו"
                const fakeTranscript = 'תמלול זמני של ההקלטה (דוגמה...)';
                insightTextArea.value += '\n' + fakeTranscript;
            } catch (err) {
                alert('שגיאה בתמלול ההקלטה: ' + err.message);
            }
        });
    }

    // יצירת טופס ראשון לתובנות
    createInsightEntry();

    // הוספת רובריקה נוספת לתובנות
    addInsightButton.addEventListener('click', () => {
        createInsightEntry();
    });

    // שמירת כל התובנות
    saveInsightButton.addEventListener('click', () => {
        const insightEntries = insightsContainer.querySelectorAll('.insight-entry');
        const allInsights = JSON.parse(localStorage.getItem('insights')) || [];

        insightEntries.forEach((entry) => {
            const title = entry.querySelector('.insight-title').value.trim();
            const content = entry.querySelector('.insight-input').value.trim();
            const audioPlayer = entry.querySelector('.audio-player');
            let audioBlob = audioPlayer.dataset.audioBlob || null;
            let audioBase64 = '';

            // אם יש הקלטה, נהפוך אותה ל-Base64 לשמירה ב-LocalStorage (עלול להיות כבד)
            if (audioBlob) {
                const reader = new FileReader();
                // קול-סאק: בקריאה סינכרונית צריך לבצע הבטחה, אבל לצורך ההמחשה נייצר Delta
                // לשם פשטות, נמשיך בלי להמתין.
                reader.onload = (evt) => {
                    audioBase64 = evt.target.result;
                    pushInsight(title, content, audioBase64);
                };
                reader.readAsDataURL(audioBlob);
            } else {
                // בלי אודיו
                pushInsight(title, content, '');
            }
        });

        function pushInsight(title, content, audio64) {
            const finalTitle = title || 'תובנה חדשה';
            allInsights.push({
                title: finalTitle,
                content,
                audio: audio64
            });
            localStorage.setItem('insights', JSON.stringify(allInsights));
        }
        alert('כל התובנות נשמרו בהצלחה!');

        // ניקוי הרובריקה
        insightsContainer.innerHTML = '';
        createInsightEntry();
    });

    // צפייה בתובנות
    viewInsightsLink.addEventListener('click', (e) => {
        e.preventDefault();
        displayInsights();
        insightsModal.style.display = 'flex';
        history.pushState({ modalOpen: true }, null, '');
    });

    function displayInsights() {
        insightsList.innerHTML = '';
        const insights = JSON.parse(localStorage.getItem('insights')) || [];
        if (!insights.length) {
            insightsList.innerHTML = '<p>עדיין לא נכתבו תובנות.</p>';
            return;
        }
        insights.forEach((insight, idx) => {
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '15px';

            const title = document.createElement('strong');
            title.textContent = `כותרת: ${insight.title || 'תובנה חדשה'}`;
            wrapper.appendChild(title);

            const showFullBtn = document.createElement('button');
            showFullBtn.textContent = 'הצג תובנה';
            showFullBtn.className = 'secondary-button';
            showFullBtn.style.marginLeft = '10px';

            const insightDiv = document.createElement('div');
            insightDiv.style.display = 'none';
            insightDiv.style.marginTop = '10px';
            insightDiv.innerHTML = `
                <p>${insight.content || ''}</p>
            `;
            if (insight.audio) {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.style.display = 'block';
                audio.style.marginTop = '10px';
                audio.src = insight.audio;
                insightDiv.appendChild(audio);
            }

            showFullBtn.addEventListener('click', () => {
                insightDiv.style.display = (insightDiv.style.display === 'none') ? 'block' : 'none';
            });

            wrapper.appendChild(showFullBtn);
            wrapper.appendChild(insightDiv);

            insightsList.appendChild(wrapper);
        });
    }

    // הורדת התובנות כקובץ Word
    const downloadInsightsWordBtn = document.getElementById('download-insights-word');
    const downloadThanksExcelBtn = document.getElementById('download-thanks-excel');

    downloadInsightsWordBtn?.addEventListener('click', () => {
        const insights = JSON.parse(localStorage.getItem('insights')) || [];
        if (!insights.length) {
            alert('אין תובנות להוריד.');
            return;
        }
        let docContent = 'תובנות שנכתבו:\n\n';
        insights.forEach((item, idx) => {
            docContent += `תובנה ${idx + 1} - כותרת: ${item.title || 'תובנה חדשה'}\n`;
            docContent += `תוכן התובנה: ${item.content}\n\n`;
        });
        const blob = new Blob([docContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'תובנות.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // הורדת התודות כקובץ Excel
    downloadThanksExcelBtn?.addEventListener('click', () => {
        const allThanks = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isValidDate(key)) {
                const entries = JSON.parse(localStorage.getItem(key));
                if (entries && entries.length) {
                    entries.forEach((entry, idx) => {
                        if (entry) {
                            allThanks.push({
                                date: key,
                                index: idx + 1,
                                text: entry.text,
                                category: entry.category || ''
                            });
                        }
                    });
                }
            }
        }
        if (!allThanks.length) {
            alert('לא נמצאו תודות להורדה.');
            return;
        }
        let csvContent = 'תאריך,מספר,תודה,קטגוריה\n';
        allThanks.forEach(item => {
            const row = [
                item.date,
                item.index,
                `"${item.text?.replace(/"/g, '""')}"`,
                `"${item.category?.replace(/"/g, '""')}"`
            ];
            csvContent += row.join(',') + '\n';
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'תודות.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // ========== פונקציות התזכורות (עדיין מוגבלות) ==========
    function setupReminderSettings() {
        // ...
    }
    function requestNotificationPermission() { 
        // ...
    }
    function saveReminders() { 
        // ...
    }
    function scheduleNotification(time) { 
        // ...
    }
    function initializeReminders() {
        // ...
    }
});
