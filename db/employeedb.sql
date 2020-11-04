DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department(
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE role(
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL, 
    salary DECIMAL(12) NOT NULL,
    department_id INT(11) NOT NULL,
    PRIMARY KEY (id)

);

CREATE TABLE employee(
    id INT(11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT(11) NOT NULL,
    manager_id INT(11),
    PRIMARY KEY (id)
);
