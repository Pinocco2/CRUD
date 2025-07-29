// ...existing code...

const API_URL = '/students';

// Отримати студентів (GET)
async function getStudents() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        renderStudents(data);
    } catch (err) {
        alert('Помилка отримання студентів');
    }
}

// Відобразити студентів у таблиці
function renderStudents(students) {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.course}</td>
            <td>${student.skills.join(', ')}</td>
            <td>${student.email}</td>
            <td>${student.isEnrolled ? 'Так' : 'Ні'}</td>
            <td>
                <button class="update-btn" data-id="${student.id}">Оновити</button>
                <button class="delete-btn" data-id="${student.id}">Видалити</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Додаємо обробники подій для кнопок
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => deleteStudent(btn.dataset.id);
    });
    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.onclick = () => updateStudent(btn.dataset.id);
    });
}

// Додати нового студента (POST)
async function addStudent(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = +document.getElementById('age').value;
    const course = document.getElementById('course').value;
    const skills = document.getElementById('skills').value.split(',').map(s => s.trim());
    const email = document.getElementById('email').value;
    const isEnrolled = document.getElementById('isEnrolled').checked;

    const student = { name, age, course, skills, email, isEnrolled };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        getStudents();
        e.target.reset();
    } catch (err) {
        alert('Помилка додавання студента');
    }
}

// Оновити студента (PATCH)
async function updateStudent(id) {
    // Для простоти: prompt для кожного поля (можна зробити краще через модальне вікно)
    const name = prompt("Нове ім'я:");
    const age = prompt("Новий вік:");
    const course = prompt("Новий курс:");
    const skills = prompt("Нові навички (через кому):");
    const email = prompt("Новий email:");
    const isEnrolled = confirm("Записаний? OK - Так, Cancel - Ні");

    const updated = {
        name,
        age: Number(age),
        course,
        skills: skills.split(',').map(s => s.trim()),
        email,
        isEnrolled
    };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        getStudents();
    } catch (err) {
        alert('Помилка оновлення студента');
    }
}

// Видалити студента (DELETE)
async function deleteStudent(id) {
    if (!confirm('Видалити цього студента?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        getStudents();
    } catch (err) {
        alert('Помилка видалення студента');
    }
}

// Обробники подій
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('get-students-btn').onclick = getStudents;
    document.getElementById('add-student-form').onsubmit = addStudent;
    // Можна автоматично завантажувати студентів при старті:
    // getStudents();
});

// ...existing code...