CREATE DATABASE IF NOT EXISTS employeeTracker_db;

USE employeeTracker_db;

CREATE TABLE IF NOT EXISTS department (
	id INT NOT NULL AUTO_INCREMENT,
    department VARCHAR(30) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS role (
	id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10) NOT NULL,
    department_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE IF NOT EXISTS employee (
	id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    PRIMARY KEY(id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);

INSERT INTO department (department)
VALUES 
("Sales"),
("Engineering"),
("Finance"),
("Legal");

INSERT INTO role (title, salary, department_id)
VALUES
("Sales Lead", 100000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 120000, 2),
("Accountant", 125000, 3),
("Legal Team Lead", 250000, 4),
("Lawyer",190000, 4),
("Lead Engineer", 150000, 2);

INSERT INTO employee (first_name, last_name, role_id)
VALUES
("Kerry", "Smith", 1),
("Nicole", "Noonan", 2),
("Tyler", "Timken", 3),
("Shannon", "Alexander", 4),
("Mary", "Killeen", 5),
("Andre", "Sayre", 6),
("Zac", "Efron", 7),
("Denis", "Donuts", 8);