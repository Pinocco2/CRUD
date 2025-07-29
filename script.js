document.addEventListener('DOMContentLoaded', () => {
  const getStudentsBtn = document.querySelector('#get-students-btn');
  const studentsTableBody = document.querySelector('#students-table tbody');
  const addStudentForm = document.querySelector('#add-student-form');

  if (!getStudentsBtn || !studentsTableBody || !addStudentForm) {
    console.error('Required DOM elements not found!');
    alert('Помилка: Не знайдено необхідні елементи на сторінці! Перевірте HTML-структуру.');
    return;
  }

  let studentsData = [];
getStudentsBtn.addEventListener('click', async () => {
    try {
      console.log('Button clicked: Attempting to fetch students...');
      await getStudents();
      console.log('Final students data to render:', studentsData);
      await renderStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert(`Помилка завантаження студентів: ${error.message}. Перевірте консоль браузера (F12) та наявність файлу students.json у корені репозиторію.`);
      studentsTableBody.innerHTML = `<tr><td colspan="8">Помилка: ${error.message}</td></tr>`;
    }
  });

  addStudentForm.addEventListener('submit', async (e) => {
    try {
      e.preventDefault();
      console.log('Form submitted: Adding student...');
      await addStudent(e);
    } catch (error) {
      console.error('Error adding student:', error);
      alert(`Помилка додавання студента: ${error.message}`);
    }
  });
async function getStudents() {
    try {
      console.log('Fetching students...');
      const storedData = localStorage.getItem('students');
      if (storedData) {
        console.log('Found data in localStorage:', storedData);
        try {
          studentsData = JSON.parse(storedData);
          if (!Array.isArray(studentsData)) {
            console.warn('localStorage data is not an array, resetting...');
            localStorage.removeItem('students');
            studentsData = [];
          } else {
            console.log('Parsed localStorage data:', studentsData);
          }
        } catch (parseError) {
          console.error('Error parsing localStorage data:', parseError);
          alert('Помилка: Дані в localStorage пошкоджені. Скидаємо localStorage.');
          localStorage.removeItem('students');
          studentsData = [];
        }
      }

      if (studentsData.length === 0) {
        console.log('No valid data in localStorage, fetching from ./students.json');
        const response = await fetch('./students.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}. Перевірте, чи файл students.json є в корені репозиторію.`);
        }
        const data = await response.json();
        console.log('Fetched data from students.json:', data);
        if (!data.students || !Array.isArray(data.students)) {
          throw new Error('Некоректна структура students.json: поле "students" відсутнє або не є масивом.');
        }
        studentsData = data.students;
        localStorage.setItem('students', JSON.stringify(studentsData));
        console.log('Saved fetched data to localStorage:', studentsData);
      }
      console.log('Simulated GET /students:', studentsData);
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }
async function renderStudents(students) {
    try {
      console.log('Rendering students:', students);
      studentsTableBody.innerHTML = '';
      if (!students || students.length === 0) {
        studentsTableBody.innerHTML = '<tr><td colspan="8">Немає студентів для відображення</td></tr>';
        console.log('No students to render');
        return;
      }
      students.forEach(student => {
        if (!student.id || !student.name || !student.age || !student.course || !student.skills || !student.email) {
          console.warn('Skipping invalid student data:', student);
          return;
        }
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${student.id}</td>
          <td>${student.name}</td>
          <td>${student.age}</td>
          <td>${student.course}</td>
          <td>${student.skills.join(', ')}</td>
          <td>${student.email}</td>
          <td>${student.isEnrolled ? 'Записаний' : 'Не записаний'}</td>
          <td>
            <button onclick="updateStudent(${student.id})">Оновити</button>
            <button onclick="deleteStudent(${student.id})">Видалити</button>
          </td>
        `;
        studentsTableBody.appendChild(row);
      });
      console.log('Students rendered successfully');
    } catch (error) {
      console.error('Error rendering students:', error);
      studentsTableBody.innerHTML = `<tr><td colspan="8">Помилка рендерингу студентів: ${error.message}</td></tr>`;
      throw error;
    }
  }
async function addStudent(e) {
    try {
      const name = document.querySelector('#name').value.trim();
      const age = parseInt(document.querySelector('#age').value);
      const course = document.querySelector('#course').value.trim();
      const skills = document.querySelector('#skills').value.split(',').map(skill => skill.trim()).filter(skill => skill);
      const email = document.querySelector('#email').value.trim();
      const isEnrolled = document.querySelector('#isEnrolled').checked;

      if (!name || isNaN(age) || !course || !skills.length || !email) {
        throw new Error('Усі поля обов’язкові та мають бути валідними!');
      }

      const newStudent = {
        id: studentsData.length ? Math.max(...studentsData.map(s => s.id)) + 1 : 1,
        name,
        age,
        course,
        skills,
        email,
        isEnrolled
      };
      studentsData.push(newStudent);
      localStorage.setItem('students', JSON.stringify(studentsData));

      console.log('Simulated POST /students:', newStudent);
      await renderStudents(studentsData);
      addStudentForm.reset();
      console.log('Student added and form reset');
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  }

async function updateStudent(id) {
    try {
      console.log('Updating student with id:', id);
      const student = studentsData.find(s => s.id === id);
      if (!student) {
        throw new Error(`Студента з id ${id} не знайдено`);
      }

      const name = prompt('Введіть нове ім\'я:', student.name)?.trim() || student.name;
      const ageInput = prompt('Введіть новий вік:', student.age);
      const age = parseInt(ageInput) || student.age;
      const course = prompt('Введіть новий курс:', student.course)?.trim() || student.course;
      const skillsInput = prompt('Введіть нові навички (через кому):', student.skills.join(', '));
      const skills = skillsInput ? skillsInput.split(',').map(skill => skill.trim()).filter(skill => skill) : student.skills;
      const email = prompt('Введіть новий email:', student.email)?.trim() || student.email;
      const isEnrolled = confirm('Чи записаний студент?') ?? student.isEnrolled;

      if (!name || isNaN(age) || !course || !skills.length || !email) {
        throw new Error('Усі поля мають бути валідними!');
      }

      const updatedStudent = { id, name, age, course, skills, email, isEnrolled };
      studentsData = studentsData.map(s => s.id === id ? updatedStudent : s);
      localStorage.setItem('students', JSON.stringify(studentsData));

      console.log('Simulated PATCH /students/' + id + ':', updatedStudent);
      await renderStudents(studentsData);
      console.log('Student updated successfully');
    } catch (error) {
      console.error('Error updating student:', error);
      alert(`Помилка оновлення студента: ${error.message}`);
    }
  }

async function deleteStudent(id) {
    try {
      console.log('Deleting student with id:', id);
      studentsData = studentsData.filter(s => s.id !== id);
      localStorage.setItem('students', JSON.stringify(studentsData));

      console.log('Simulated DELETE /students/' + id);
      await renderStudents(studentsData);
      console.log('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      alert(`Помилка видалення студента: ${error.message}`);
    }
  }
});