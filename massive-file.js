```javascript
/**
 * ====================================================================
 * APLIKACJA DO ZARZĄDZANIA ZADANIAMI
 * ====================================================================
 * Kompletny system zarządzania zadaniami z priorytetami, kategoriami,
 * terminami realizacji oraz zaawansowanymi funkcjami filtrowania
 * i statystyk.
 * 
 * @author System zarządzania zadaniami
 * @version 2.0.0
 * @license MIT
 * ====================================================================
 */

'use strict';

// ====================================================================
// MODUŁ KONFIGURACJI
// ====================================================================

const CONFIG = {
  APP_NAME: 'TaskMaster Pro',
  VERSION: '2.0.0',
  STORAGE_KEY: 'taskmaster_data',
  MAX_TASKS: 1000,
  PRIORITIES: {
    LOW: { value: 1, label: 'Niski', color: '#28a745' },
    MEDIUM: { value: 2, label: 'Średni', color: '#ffc107' },
    HIGH: { value: 3, label: 'Wysoki', color: '#fd7e14' },
    CRITICAL: { value: 4, label: 'Krytyczny', color: '#dc3545' }
  },
  STATUSES: {
    TODO: { value: 'todo', label: 'Do zrobienia' },
    IN_PROGRESS: { value: 'in_progress', label: 'W trakcie' },
    COMPLETED: { value: 'completed', label: 'Ukończone' },
    CANCELLED: { value: 'cancelled', label: 'Anulowane' }
  },
  CATEGORIES: [
    'Praca',
    'Osobiste',
    'Zakupy',
    'Zdrowie',
    'Edukacja',
    'Finanse',
    'Dom',
    'Inne'
  ]
};

// ====================================================================
// KLASA ZADANIA
// ====================================================================

class Task {
  /**
   * Konstruktor zadania
   * @param {Object} data - Dane zadania
   */
  constructor(data) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.description = data.description || '';
    this.priority = data.priority || 'MEDIUM';
    this.status = data.status || 'TODO';
    this.category = data.category || 'Inne';
    this.dueDate = data.dueDate || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    this.tags = data.tags || [];
    this.subtasks = data.subtasks || [];
    this.estimatedTime = data.estimatedTime || 0;
    this.actualTime = data.actualTime || 0;
    this.assignedTo = data.assignedTo || null;
    this.notes = data.notes || [];
  }

  /**
   * Generuje unikalny identyfikator
   * @returns {string} Unikalny ID
   */
  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Waliduje dane zadania
   * @returns {Object} Obiekt z wynikiem walidacji
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Tytuł zadania jest wymagany');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Tytuł zadania może mieć maksymalnie 200 znaków');
    }

    if (this.description && this.description.length > 2000) {
      errors.push('Opis zadania może mieć maksymalnie 2000 znaków');
    }

    if (!CONFIG.PRIORITIES[this.priority]) {
      errors.push('Nieprawidłowy priorytet zadania');
    }

    if (!Object.values(CONFIG.STATUSES).find(s => s.value === this.status)) {
      errors.push('Nieprawidłowy status zadania');
    }

    if (this.dueDate && !this.isValidDate(this.dueDate)) {
      errors.push('Nieprawidłowa data terminu');
    }

    if (this.estimatedTime < 0 || this.actualTime < 0) {
      errors.push('Czas nie może być ujemny');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Sprawdza poprawność daty
   * @param {string} dateString - Data do sprawdzenia
   * @returns {boolean} Czy data jest poprawna
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Sprawdza czy zadanie jest przeterminowane
   * @returns {boolean} Czy zadanie jest przeterminowane
   */
  isOverdue() {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
      return false;
    }
    return new Date(this.dueDate) < new Date();
  }

  /**
   * Zwraca liczbę dni do terminu
   * @returns {number|null} Liczba dni lub null
   */
  getDaysUntilDue() {
    if (!this.dueDate) return null;
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Oznacza zadanie jako ukończone
   */
  complete() {
    this.status = 'completed';
    this.completedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Dodaje podzadanie
   * @param {Object} subtask - Dane podzadania
   */
  addSubtask(subtask) {
    this.subtasks.push({
      id: this.generateId(),
      title: subtask.title,
      completed: false,
      createdAt: new Date().toISOString()
    });
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Dodaje notatkę
   * @param {string} noteText - Treść notatki
   */
  addNote(noteText) {
    this.notes.push({
      id: this.generateId(),
      text: noteText,
      createdAt: new Date().toISOString()
    });
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Konwertuje zadanie do formatu JSON
   * @returns {Object} Obiekt JSON
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      category: this.category,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      tags: this.tags,
      subtasks: this.subtasks,
      estimatedTime: this.estimatedTime,
      actualTime: this.actualTime,
      assignedTo: this.assignedTo,
      notes: this.notes
    };
  }
}

// ====================================================================
// MENEDŻER ZADAŃ
// ====================================================================

class TaskManager {
  constructor() {
    this.tasks = [];
    this.filters = {
      status: null,
      priority: null,
      category: null,
      searchTerm: '',
      dateFrom: null,
      dateTo: null,
      tags: []
    };
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.initialize();
  }

  /**
   * Inicjalizuje menedżera zadań
   */
  initialize() {
    this.loadFromStorage();
    console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} zainicjalizowany`);
    console.log(`Załadowano ${this.tasks.length} zadań`);
  }

  /**
   * Tworzy nowe zadanie
   * @param {Object} taskData - Dane zadania
   * @returns {Object} Wynik operacji
   */
  createTask(taskData) {
    try {
      // Sprawdź limit zadań
      if (this.tasks.length >= CONFIG.MAX_TASKS) {
        return {
          success: false,
          error: `Osiągnięto maksymalną liczbę zadań (${CONFIG.MAX_TASKS})`
        };
      }

      const task = new Task(taskData);
      const validation = task.validate();

      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      this.tasks.push(task);
      this.saveToStorage();

      return {
        success: true,
        task: task,
        message: 'Zadanie zostało utworzone pomyślnie'
      };
    } catch (error) {
      return {
        success: false,
        error: `Błąd podczas tworzenia zadania: ${error.message}`
      };
    }
  }

  /**
   * Aktualizuje istniejące zadanie
   * @param {string} taskId - ID zadania
   * @param {Object} updates - Dane do aktualizacji
   * @returns {Object} Wynik operacji
   */
  updateTask(taskId, updates) {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        return {
          success: false,
          error: 'Nie znaleziono zadania'
        };
      }

      const task = this.tasks[taskIndex];
      Object.assign(task, updates);
      task.updatedAt = new Date().toISOString();

      const validation = task.validate();

      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      this.saveToStorage();

      return {
        success: true,
        task: task,
        message: 'Zadanie zostało zaktualizowane pomyślnie'
      };
    } catch (error) {
      return {
        success: false,
        error: `Błąd podczas aktualizacji zadania: ${error.message}`
      };
    }
  }

  /**
   * Usuwa zadanie
   * @param {string} taskId - ID zadania
   * @returns {Object} Wynik operacji
   */
  deleteTask(taskId) {
    try {
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        return {
          success: false,
          error: 'Nie znaleziono zadania'
        };
      }

      const deletedTask = this.tasks.splice(taskIndex, 1)[0];
      this.saveToStorage();

      return {
        success: true,
        task: deletedTask,
        message: 'Zadanie zostało usunięte pomyślnie'
      };
    } catch (error) {
      return {
        success: false,
        error: `Błąd podczas usuwania zadania: ${error.message}`
      };
    }
  }

  /**
   * Pobiera zadanie po ID
   * @param {string} taskId - ID zadania
   * @returns {Task|null} Zadanie lub null
   */
  getTaskById(taskId) {
    return this.tasks.find(t => t.id === taskId) || null;
  }

  /**
   * Pobiera wszystkie zadania z zastosowaniem filtrów i sortowania
   * @returns {Array} Tablica zadań
   */
  getAllTasks() {
    let filteredTasks = [...this.tasks];

    // Filtrowanie po statusie
    if (this.filters.status) {
      filteredTasks = filteredTasks.filter(t => t.status === this.filters.status);
    }

    // Filtrowanie po priorytecie
    if (this.filters.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === this.filters.priority);
    }

    // Filtrowanie po kategorii
    if (this.filters.category) {
      filteredTasks = filteredTasks.filter(t => t.category === this.filters.category);
    }

    // Filtrowanie po wyszukiwanej frazie
    if (this.filters.searchTerm) {
      const searchLower = this.filters.searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrowanie po datach
    if (this.filters.dateFrom) {
      const dateFrom = new Date(this.filters.dateFrom);
      filteredTasks = filteredTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) >= dateFrom;
      });
    }

    if (this.filters.dateTo) {
      const dateTo = new Date(this.filters.dateTo);
      filteredTasks = filteredTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) <= dateTo;
      });
    }

    // Filtrowanie po tagach
    if (this.filters.tags.length > 0) {
      filteredTasks = filteredTasks.filter(t =>
        this.filters.tags.some(tag => t.tags.includes(tag))
      );
    }

    // Sortowanie
    filteredTasks.sort((a, b) => {
      let compareValue = 0;

      switch (this.sortBy) {
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'priority':
          compareValue = CONFIG.PRIORITIES[b.priority].value - CONFIG.PRIORITIES[a.priority].value;
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) compareValue = 0;
          else if (!a.dueDate) compareValue = 1;
          else if (!b.dueDate) compareValue = -1;
          else compareValue = new Date(a.dueDate) - new Date(b.dueDate);
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'updatedAt':
          compareValue = new Date(a.upd