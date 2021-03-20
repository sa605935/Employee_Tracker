var inquirer = require("inquirer");
var mysql = require("mysql2");
var cTable = require("console.table");
const logo = require("asciiart-logo");
const chalk = require("chalk");
const config = require("./package.json");
console.log(logo(config).render());
require('dotenv').config();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect(function (err) {
    if (err) {
        console.error("error connection: " + err.stack);
        return;
    }
    // console.log("connected as id " + connection.threadId);
    init();
});

var choices = [
    "View ALL Employees",
    "View ALL Employees by Roles",
    "View ALL Employees by Department",
    "Add Employee",
    "Add Role",
    "Add Department",
    "Remove Employee",
    "Remove Role",
    "Remove Department",
    "Update Employee Role",
    "Get Budget",
    "Exit",
];
var departments = [];
var deptIDS = [];
var roles = [];
var rolesIDS = [];
var employees = [];
var employeeIDS = [];

function getDept() {
    connection.query("SELECT id, department FROM department", function (
        err,
        res
    ) {
        departments = [];
        res.forEach((item) => {
            departments.push(item.department);
        });
        res.forEach((item) => {
            var obj = {
                id: item.id,
                department: item.department,
            };
            deptIDS.push(obj);
        });
    });
}

function getRoles() {
    connection.query("SELECT id, title FROM role", function (err, res) {
        roles = [];
        res.forEach((item) => {
            if (roles.indexOf(item.title) === -1) {
                roles.push(item.title);
            }
        });
        res.forEach((item) => {
            var obj = {
                id: item.id,
                role: item.title,
            };
            rolesIDS.push(obj);
        });
    });
}

function getEmp() {
    connection.query(
        "SELECT id, first_name, last_name FROM employee",
        function (err, res) {
            employees = [];
            res.forEach((item) => {
                var fullName = `${item.first_name} ${item.last_name}`;
                employees.push(fullName);
            });
            employeeIDS = [];
            res.forEach((item) => {
                var obj = {
                    id: item.id,
                    firstName: item.first_name,
                    lastName: item.last_name,
                };
                employeeIDS.push(obj);
            });
        }
    );
}

function init() {
    getDept();
    getRoles();
    getEmp();
    inquirer
        .prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do?",
                choices: choices,
            },
        ])
        .then(function (response) {
            switch (response.choice) {
                case "View ALL Employees":
                    viewEmp();
                    break;
                case "View ALL Employees by Roles":
                    viewRoles();
                    break;
                case "View ALL Employees by Department":
                    viewDept();
                    break;
                case "Add Employee":
                    addEmp();
                    break;
                case "Add Role":
                    addRole();
                    break;
                case "Add Department":
                    addDept();
                    break;
                case "Remove Employee":
                    removeEmp();
                    break;
                case "Remove Role":
                    removeRole();
                    break;
                case "Remove Department":
                    removeDept();
                    break;
                case "Update Employee Role":
                    updateEmp();
                    break;
                case "Get Budget":
                    getBudget();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
}

function viewEmp() {
    const query = `
        SELECT a.id, a.first_name, a.last_name, b.title, c.department, b.salary
        FROM employee a
        INNER JOIN role b ON (a.role_id = b.id)
        INNER JOIN department c ON (b.department_id = c.id)
        ORDER BY a.id
        `;
    connection.query(query, function (err, res) {
        console.table(res);
        init();
    });
}

function viewRoles() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "role",
                message: "Which role would you like to view?",
                choices: roles,
            },
        ])
        .then(function (response) {
            const query = `
                SELECT a.id, a.first_name, a.last_name, b.title, c.department, b.salary
                FROM employee a
                INNER JOIN role b ON (a.role_id = b.id)
                INNER JOIN department c ON (b.department_id = c.id)
                WHERE b.title = ?
            `;
            connection.query(query, response.role, function (err, res) {
                console.table(res);
                init();
            });
        });
}

function viewDept() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "dept",
                message: "Which department would you like to view?",
                choices: departments,
            },
        ])
        .then(function (response) {
            const query = `
                SELECT a.id, a.first_name, a.last_name, b.title, c.department, b.salary
                FROM employee a
                INNER JOIN role b ON (a.role_id = b.id)
                INNER JOIN department c ON (b.department_id = c.id)
                WHERE c.department = ?
            `;
            connection.query(query, response.dept, function (err, res) {
                console.table(res);
                init();
            });
        });
}

function addEmp() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message:
                    "What is the first name of the employee you would like to add?",
            },
            {
                type: "input",
                name: "lastName",
                message:
                    "What is the last name of the employee you would like to add?",
            },
            {
                type: "list",
                name: "role",
                message: "Choose the role of the new employee:",
                choices: roles,
            },
        ])
        .then(function (response) {
            var roleID = "";
            rolesIDS.forEach((item) => {
                if (response.role === item.role) {
                    roleID = item.id;
                }
            });
            connection.query(
                "INSERT INTO employee SET ?",
                {
                    first_name: response.firstName,
                    last_name: response.lastName,
                    role_id: roleID,
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(chalk.green("Employee added successfully!"));
                    init();
                }
            );
        });
}

function addRole() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "newRole",
                message: "What is the new role that you would like to add?",
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary?",
            },
            {
                type: "list",
                name: "dept",
                message: "What department does it belong to?",
                choices: departments,
            },
        ])
        .then(function (response) {
            var deptID = "";
            deptIDS.forEach((item) => {
                if (response.dept === item.department) {
                    deptID = item.id;
                }
            });
            connection.query(
                "INSERT INTO role SET ?",
                {
                    title: response.newRole,
                    salary: response.salary,
                    department_id: deptID,
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(chalk.green("Role added successfully!"));
                    init();
                }
            );
        });
}

function addDept() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "newDept",
                message:
                    "What is the new department that you would like to add?",
            },
        ])
        .then(function (response) {
            connection.query(
                "INSERT INTO department SET ?",
                {
                    department: response.newDept,
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(chalk.green("Department added successfully!"));
                    init();
                }
            );
        });
}

function removeEmp() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee would you like to remove?",
                choices: employees,
            },
        ])
        .then(function (response) {
            var name = response.employee.split(" ");
            var empID;
            employeeIDS.forEach((item) => {
                if (name[0] === item.firstName && name[1] === item.lastName) {
                    empID = item.id;
                }
            });
            connection.query(
                "DELETE FROM employee WHERE?",
                {
                    id: empID,
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(chalk.green("Employee removed successfully!"));
                    init();
                }
            );
        });
}

function removeRole() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "role",
                message: "Which role would you like to remove?",
                choices: roles,
            },
        ])
        .then(function (response) {
            connection.query(
                "DELETE FROM role WHERE ?",
                {
                    title: response.role,
                },
                function (err, res) {
                    if (err) {
                        console.log(
                            chalk.red(
                                "ERROR: Cannot remove role because an employee/employees is currently assigned to that role."
                            )
                        );
                    } else {
                        console.log(chalk.green("Role removed successfully!"));
                    }
                    init();
                }
            );
        });
}

function removeDept() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "department",
                message: "Which role would you like to remove?",
                choices: departments,
            },
        ])
        .then(function (response) {
            connection.query(
                "DELETE FROM department WHERE ?",
                {
                    department: response.department,
                },
                function (err, res) {
                    if (err) {
                        console.log(
                            chalk.red(
                                "ERROR: Cannot remove department because a role/roles is currently assigned to that department."
                            )
                        );
                    } else {
                        console.log(
                            chalk.green("Department removed successfully!")
                        );
                    }
                    init();
                }
            );
        });
}

function updateEmp() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee would you like to update?",
                choices: employees,
            },
            {
                type: "list",
                name: "newRole",
                message: "What is their new role?",
                choices: roles,
            },
        ])
        .then(function (response) {
            var name = response.employee.split(" ");
            var empID;
            employeeIDS.forEach((item) => {
                if (name[0] === item.firstName && name[1] === item.lastName) {
                    empID = item.id;
                }
            });
            var roleID = "";
            rolesIDS.forEach((item) => {
                if (response.newRole === item.role) {
                    roleID = item.id;
                }
            });

            connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                    {
                        role_id: roleID,
                    },
                    {
                        id: empID,
                    },
                ],
                function (err, res) {
                    if (err) throw err;
                    console.log(
                        chalk.green(`${response.employee}'s role is updated!`)
                    );
                    init();
                }
            );
        });
}

function getBudget() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "budget",
                message: "Which budget would you like to view?",
                choices: [
                    "All departments combined",
                    "An individual department",
                ],
            },
        ])
        .then(function (response) {
            if (response.budget === "All departments combined") {
                const query = `
                    SELECT b.salary
                    FROM employee a
                    INNER JOIN role b ON (a.role_id = b.id)
                    INNER JOIN department c ON (b.department_id = c.id)
                    `;
                connection.query(query, function (err, res) {
                    if (err) throw err;
                    var budget = 0;
                    res.forEach((emp) => {
                        budget += parseInt(emp.salary);
                    });
                    console.log(
                        chalk.green(
                            `The combined budget of all departments is: $${budget}`
                        )
                    );
                    init();
                });
            } else {
                getDeptBudget();
            }
        });
}

function getDeptBudget() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "dept",
                message: "Which department budget would you like to view?",
                choices: departments,
            },
        ])
        .then(function (response) {
            const query = `
                    SELECT b.salary
                    FROM employee a
                    INNER JOIN role b ON (a.role_id = b.id)
                    INNER JOIN department c ON (b.department_id = c.id)
                    WHERE c.department = ?
                    `;
            connection.query(query, response.dept, function (err, res) {
                if (err) throw err;
                var budget = 0;
                res.forEach((emp) => {
                    budget += parseInt(emp.salary);
                });
                console.log(
                    chalk.green(
                        `The budget of the ${response.dept} department is: $${budget}`
                    )
                );
                init();
            });
        });
}