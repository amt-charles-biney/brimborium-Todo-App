/*
  Warnings:

  - A unique constraint covering the columns `[topic,description,dueDate]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Task_topic_description_dueDate_key" ON "Task"("topic", "description", "dueDate");
