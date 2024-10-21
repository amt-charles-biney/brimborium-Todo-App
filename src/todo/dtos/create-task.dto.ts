/**
 * Data Transfer Object (DTO) for creating a new task.
 */
export class CreateTaskDTO {
  /**
   * The topic or title of the task.
   *
   * @type {string}
   */
  topic: string;

  /**
   * The description of the task.
   *
   * @type {string}
   */
  description: string;

  /**
   * The due date of the task.
   *
   * @type {Date}
   */
  dueDate: Date;
}
