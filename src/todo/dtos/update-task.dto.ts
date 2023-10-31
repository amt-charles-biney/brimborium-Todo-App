export class UpdateTaskDTO {
  /**
   * The topic or title of the task.
   *
   * @type {string}
   */
  topic?: string;

  /**
   * The description of the task.
   *
   * @type {string}
   */
  description?: string;

  /**
   * The due date of the task.
   *
   * @type {Date}
   */
  dueDate?: Date;
}
