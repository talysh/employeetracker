USE employee_db;

INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('1', 'Sales Lead', '100000', '1');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('2', 'Salesperson', '80000', '1');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('3', 'Lead Engineer', '150000', '2');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('4', 'Software Engineer', '120000', '2');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('5', 'Account Manager', '90000', '1');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('6', 'Accountant', '125000', '3');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('7', 'Legal Team Lead', '250000', '4');
INSERT INTO `employee_db`.`role` (`id`, `title`, `salary`, `department_id`) VALUES ('8', 'Lawyer', '190000', '4');

INSERT INTO `employee_db`.`department` (`id`, `name`) VALUES ('1', 'Sales');
INSERT INTO `employee_db`.`department` (`id`, `name`) VALUES ('2', 'Engineering');
INSERT INTO `employee_db`.`department` (`id`, `name`) VALUES ('3', 'Finance');
INSERT INTO `employee_db`.`department` (`id`, `name`) VALUES ('4', 'Legal');

