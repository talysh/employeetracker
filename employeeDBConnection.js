const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require('util');
const cTable = require('console.table');


const menuChoices = [
    "View All Employees",
    "View All Employees By Department",
    "View All Employees By Manager",
    "Add Employee",
    "Remove Employee",
    "Update Employee Role",
    "Update Employee Manager",
    "Add Department",
    "Add Role",
    "Exit"
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
    selectAction();
});


// Helper Functions----------
//---------------------------
// Return Id of the individual
const returnId = (person) => {
    return person.split(" ")[0];
}

//Inquirer input question
const inputQuestion = (inputMessage, inputName) => {
    return {
        name: inputName,
        type: "input",
        message: inputMessage
    }
}

// Inquirer list question
const listQuestion = (inputMessage, inputChoices, inputName) => {
    return {
        name: inputName,
        type: "list",
        choices: inputChoices,
        message: inputMessage
    }

}


// Turn array of objects, into array of strings
const returnArrayOfStrings = (result) => {
    const list = []
    result.forEach(object => {
        const element = Object.values(object).join(" ");
        list.push(element);
    });
    return list;
}



// Getting list of employees and returning it as an array
const getListOfEmployees = async () => {
    let listOfEmployees = [];
    try {
        const result = await query("SELECT id, first_name, last_name FROM employee");
        listOfEmployees = returnArrayOfStrings(result);
    } catch (error) {
        throw error;
    }
    return listOfEmployees;
}


// Main functions-----------------
// -------------------------------
// Removing employee from database

const removeEmployee = async () => {
    const employeeList = await getListOfEmployees();
    inquirer.prompt(listQuestion("Which employee would you like to remove?", employeeList, "employee")).then((answers) => {
        const removeId = returnId(answers.employee);
        connection.query("DELETE FROM employee WHERE id = ?", removeId, (err, result) => {
            if (err) throw err;
        });
        selectAction();
    });
}


// Adding employee to database
const addEmployee = async () => {
    const roles = await getRoles();
    let employeeList = await getListOfEmployees();
    employeeList.unshift("0 None");
    inquirer.prompt([
        inputQuestion("What is the employee's first name?", "first_name"),
        inputQuestion("What is the employee's last name?", "last_name"),
        listQuestion("What is the employee's role", roles, "role"),
        listQuestion("Who is the employee's manager?", employeeList, "manager"),
    ]).then((answers) => {
        console.log(answers.role);
        const role_id = returnId(answers.role);
        const manager_id = returnId(answers.manager);
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)", [answers.first_name, answers.last_name, role_id, manager_id], (err, result) => {
            selectAction();
        });
    });
}

// View all employees
const viewAllEmployees = async () => {
    const rows = await query(`SELECT e1.id id, 
    e1.first_name first_name, 
    e1.last_name last_name, 
    role.title title, 
    department.name department, 
    role.salary salary,
    CONCAT(e2.first_name, ' ', e2.last_name) manager_name 
    FROM employee AS e1 LEFT JOIN employee AS e2 
        ON e1.manager_id = e2.id
    INNER JOIN role 
        ON (e1.role_id = role.id) 
    INNER JOIN department 
        ON (role.department_id = department.id);`);
    console.table(rows);
    selectAction();
}

// Prompt the department for viewing
const selectDepartment = async () => {
    const departments = await getDepartments();
    inquirer.prompt(listQuestion("Which department would you like to view?", departments, "department")).then((answers) => {
        viewByDepartment(returnId(answers.department));
    });
}


// Viewing employees of a given department
const viewByDepartment = async (departmentId) => {
    const rows = await query(`SELECT e1.id id, 
    e1.first_name first_name, 
    e1.last_name last_name, 
    role.title title, 
    department.name department, 
    role.salary salary,
    CONCAT(e2.first_name, ' ', e2.last_name) manager_name 
    FROM employee AS e1 LEFT JOIN employee AS e2 
        ON e1.manager_id = e2.id
    INNER JOIN role 
        ON (e1.role_id = role.id) 
    INNER JOIN department 
        ON (role.department_id = department.id)
        WHERE department.id = '${departmentId}';`);
    console.table(rows);
    selectAction();
}

// Update employee role
const updateRole = async () => {
    let employees = await getListOfEmployees();
    const roles = await getRoles();
    let employeeId;
    inquirer.prompt(listQuestion("Which employee's role would you like to update?", employees, "employee")).then((answers) => {
        employeeId = returnId(answers.employee);
        inquirer.prompt(listQuestion("What is the employee's new role?", roles, "newRole")).then((answers) => {
            connection.query("UPDATE employee SET role_id = ? WHERE id = ?;", [returnId(answers.newRole), employeeId], (err, result) => {
                selectAction();
            });
        });

    });
}



// Update employee manager
const updateManager = async () => {
    let employees = await getListOfEmployees();
    let employeeId;
    inquirer.prompt(listQuestion("Which employee's manager would you like to update?", employees, "employee")).then((answers) => {
        employeeId = returnId(answers.employee);
        employees.unshift("0 None");
        inquirer.prompt(listQuestion("Who is the employee's new manager?", employees, "newManager")).then((answers) => {
            const managerId = returnId(answers.newManager);
            connection.query("UPDATE employee SET manager_id = ? WHERE id = ?;", [managerId, employeeId], (err, result) => {
                selectAction();
            });
        });

    });
}

// View employees by manager
const viewByManager = async () => {
    let managersArray = [];
    const managers = await query(`SELECT DISTINCT e2.id,
     e2.first_name, 
     e2.last_name 
     FROM employee AS e1 
     INNER JOIN employee AS e2 
        ON e2.id = e1.manager_id 
    WHERE e2.manager_id IS NOT NULL;`);
    managersArray = returnArrayOfStrings(managers);
    inquirer.prompt(listQuestion("Which manager's employees would you like to view?", managersArray, "manager")).then(async (answers) => {
        const managerId = returnId(answers.manager);;

        const rows = await query(`SELECT e1.id id, 
        e1.first_name first_name, 
        e1.last_name last_name, 
        role.title title, 
        department.name department, 
        role.salary salary,
        CONCAT(e2.first_name, ' ', e2.last_name) manager_name 
        FROM employee AS e1 LEFT JOIN employee AS e2 
            ON e1.manager_id = e2.id
        INNER JOIN role 
            ON (e1.role_id = role.id) 
        INNER JOIN department 
            ON (role.department_id = department.id)
        WHERE e1.manager_id = ${managerId};`);
        console.table(rows);
        selectAction();
    });

}


// Get list of available departments 
const getDepartments = async () => {
    let rows = await query("SELECT * FROM department");
    return returnArrayOfStrings(rows);
}

// Get list of roles
const getRoles = async () => {
    let rows = await query("SELECT id, title FROM role");
    return returnArrayOfStrings(rows);
}

// Add a new department
const addDepartment = () => {
    inquirer.prompt(inputQuestion("Please, enter department name: ", "departmentName")).then((answers) => {
        connection.query("INSERT INTO department (name) VALUES (?)", answers.departmentName, (err, result) => {
            connection.end();
        });
    });
}

// Add a new role

const addRole = async () => {
    const departments = await getDepartments();
    inquirer.prompt([
        inputQuestion("What is the new role title? ", "title"),
        inputQuestion("How much is the salary? ", "salary"),
        listQuestion("Which department does the role belong to? ", departments, "department")
    ]).then((answers) => {
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)", [answers.title, answers.salary, returnId(answers.department)], (err, result) => {
            selectAction();
        });

    });
}

// Main menu
const selectAction = () => {
    inquirer.prompt(listQuestion("What would you like to do?", menuChoices, "action")).then((answers) => {
        switch (answers.action) {
            case "View All Employees":
                viewAllEmployees();
                break;
            case "View All Employees By Department":
                selectDepartment();
                break;
            case "View All Employees By Manager":
                viewByManager();
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
                updateManager();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Add Role":
                addRole();
                break;
            case "Exit":
                connection.end();
                break;
        }
    });
}
