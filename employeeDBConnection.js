const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require('util');
const cTable = require('console.table');


const roles = [
    "Sales Lead",
    "Salesperson",
    "Lead Engineer",
    "Software Engineer",
    "Account Manager",
    "Accountant",
    "Legal Team Lead",
    "Lawyer"
];
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_db"
});

// Promisifying connection query
const query = util.promisify(connection.query).bind(connection);

connection.connect(function (err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    afterConnection();
});

// Getting list of employees and returning it as an array
const getListOfEmployees = async () => {
    var listOfEmployees = [];
    try {
        const result = await query("SELECT id, first_name, last_name FROM employee");
        result.forEach(object => {
            let employee = Object.values(object).join(" ");
            listOfEmployees.push(employee);
        });
    } catch (error) {
        throw error;
    }
    return listOfEmployees;
}


// Removing employee from database

const removeEmployee = async () => {
    const employeeList = await getListOfEmployees();
    inquirer.prompt([{
        name: "employee",
        type: "list",
        choices: employeeList,
        message: "Which employee would you like to remove?"

    }]).then((answers) => {
        const removeId = answers.employee.split(" ")[0];
        console.log(removeId);
        connection.query("DELETE FROM employee WHERE id = ?", removeId, (err, result) => {
            if (err) throw err;
        });
        selectAction();
    });
}


// Adding employee to database
const addEmployee = async () => {
    let employeeList = await getListOfEmployees();
    employeeList.unshift("0 None");

    inquirer.prompt([{
        name: "first_name",
        type: "input",
        message: "What is the employee's first name?"
    }, {
        name: "last_name",
        type: "input",
        message: "What is the employee's last name?"
    }, {
        name: "role",
        type: "list",
        message: "What is the employee's role?",
        choices: roles
    }, {
        name: "manager",
        type: "list",
        choices: employeeList,
        message: "Who is the employee's manager?"
    }
    ]).then((answers) => {
        const role_id = getRoleId(answers.role);
        const manager_id = answers.manager.split(" ")[0];
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [answers.first_name, answers.last_name, role_id, manager_id], (err, result) => {
            console.log(result);
            selectAction();
        });
    });
}


// Return role ID given the role 
const getRoleId = (role) => {
    let roleId;
    switch (role) {
        case "Sales Lead":
            roleId = 1;
            break;
        case "Salesperson":
            roleId = 2;
            break;
        case "Lead Engineer":
            roleId = 3;
            break;
        case "Software Engineer":
            roleId = 4;
            break;
        case "Account Manager":
            roleId = 5;
            break;
        case "Accountant":
            roleId = 6;
            break;
        case "Legal Team Lead":
            roleId = 7;
            break;
        case "Lawyer":
            roleId = 8;
            break;
        default:
            roleId = 0;
    }
    return roleId;
}

// View all employees
const viewAllEmployees = async () => {
    let rows = await query(`SELECT employee.id id, 
    employee.first_name first_name, 
    employee.last_name last_name, 
    role.title title, 
    department.name department, 
    role.salary salary 
    FROM employee 
    INNER JOIN role 
        ON (employee.role_id = role.id) 
    INNER JOIN department 
        ON (role.department_id = department.id);`);
    console.table(rows);
    selectAction();
}

// Prompt the department for viewing
const selectDepartment = async () => {
    inquirer.prompt([{
        name: "department",
        type: "list",
        message: "Which department would you like to view?",
        choices: ["Sales", "Engineering", "Finance", "Legal"]
    }]).then((answers) => {
        viewByDepartment(answers.department);
    });
}
// Viewing employees of a given department
const viewByDepartment = async (department) => {

    let rows = await query(`SELECT employee.id id, 
        employee.first_name first_name, 
        employee.last_name last_name, 
        role.title title, 
        department.name department, 
        role.salary salary 
        FROM employee
        INNER JOIN role 
            ON (employee.role_id = role.id) 
        INNER JOIN department 
            ON (role.department_id = department.id)
        WHERE department.name = '${department}';`);
    console.table(rows);
    selectAction();
}

// Update employee role

const updateRole = async () => {
    let employees = await getListOfEmployees();
    let employeeId;
    inquirer.prompt({
        name: "employee",
        type: "list",
        message: "Which employee's role would you like to update?",
        choices: employees
    }).then((answers) => {
        console.log(answers.employee);
        employeeId = answers.employee.split(" ")[0];
        inquirer.prompt({
            name: "newRole",
            type: "list",
            message: "What is the employee's new role?",
            choices: roles
        }).then((answers) => {
            console.log(getRoleId(answers.newRole));
            console.log(employeeId);
            connection.query("UPDATE employee SET role_id = ? WHERE id = ?;", [getRoleId(answers.newRole), employeeId], (err, result) => {
                selectAction();
            });
        });

    });
}
// Main menu
const selectAction = () => {
    inquirer.prompt([{
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees By Department",
            "View All Employees By Manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "Exit"
        ]
    }]).then((answers) => {
        switch (answers.action) {
            case "View All Employees":
                viewAllEmployees();
                break;
            case "View All Employees By Department":
                selectDepartment();
                break;
            case "View All Employees By Manager":
                // selectManager();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                updateRole();
                break;
            case "Update Employee Manager":
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}

const afterConnection = () => {
    selectAction();

    // connection.query("SELECT * FROM employee", (err, res) => {
    //     if (err) throw err;
    //     console.log(res);
    //     connection.end();
    // });
}