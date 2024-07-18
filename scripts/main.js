function getBreaks() {
    return (fetch('breaks.json')
    .then (response => response.json())
    .then (data => {
        return data;
}))}

function getPeriod() {
    for (brk of Breaks) {
        const times = brk[1].split('|')
        const firsttime = new Date(times[0])
        const secondtime = new Date(times[1])
        const currenttime = new Date()
        if (firsttime <= new Date() <= secondtime) {
            return [brk[0], brk[1].split('|')[1]]
        }
    };
    const currenttime = new Date();
    const day = currenttime.getDay();
    if (day == 0 || day == 6) {
        const schoolstarttime = new Date()
        schoolstarttime.setHours(8);
        schoolstarttime.setMinutes(30);
        schoolstarttime.setSeconds(0);
        schoolstarttime.setMilliseconds(0);
        return ['Weekend', schoolstarttime]
    } else if (day == 1) {
        const A_Times = [["Period 1", "08:30 09:20"],["Passing Period", "09:20 09:27"],["Period 2", "09:27 10:17"],["Brunch", "10:17 10:25"],["Passing Period", "10:25 10:32"],["Period 3", "10:32 11:22"],["Passing Period", "11:22 11:29"],["Period 4", "11:29 12:19"],["Lunch", "12:19 12:54"],["Passing Period", "12:54 13:01"],["Period 5", "13:01 13:51"],["Passing Period", "13:51 13:58"],["Period 6", "13:58 14:48"],["Passing Period", "14:48 14:55"],["Period 7", "14:55 15:45"]]
        for (item of A_Times) {
            const times = item[1].split(' ')
            const firsttime = new Date(times[0])
            const secondtime = new Date(times[1])
            const currenttime = new Date()
            if (firsttime <= new Date() <= secondtime) {
                return [item[0], item[1].split('|')[1]]
            }
        };
    }
}

function getBellData() {
    const period_time = getPeriod()
    const Period = period_time[0]
    const endtime = new Date(period_time[1]);
    const now = new Date();
    const fulltimeleft = endtime-now;
    const Hoursleft = Math.floor(fulltimeleft / (1000 * 60 * 60));
    let Minutesleft;
    if (Math.floor((fulltimeleft-(Hoursleft*(1000 * 60 * 60)))/ (1000 * 60))<10) {
        Minutesleft = "0" + Math.floor((fulltimeleft-(Hoursleft*(1000 * 60 * 60)))/ (1000 * 60));
    } else {
        Minutesleft = Math.floor((fulltimeleft-(Hoursleft*(1000 * 60 * 60)))/ (1000 * 60));
    }
    let Secondsleft;
    if (Math.floor((fulltimeleft-(Hoursleft*(1000 * 60 * 60))-(Minutesleft*(1000 * 60)))/ (1000))<10) {
        Secondsleft = "0" + Math.floor((fulltimeleft-(Hoursleft*(1000 * 60 * 60))-(Minutesleft*(1000 * 60)))/ (1000));
    } else {
        Secondsleft = Math.floor((fulltimeleft-(Hoursleft*(1000 * 60 * 60))-(Minutesleft*(1000 * 60)))/ (1000));
    }
    const timeleft = `${Hoursleft}:${Minutesleft}:${Secondsleft}`;
    document.getElementById("belldata").innerText = `${Period}: ${timeleft}`;
    document.getElementById("belldatatitle").innerText = `${Period}: ${timeleft}`;
}
function getPortfolioData() {
    fetch('/portfoliodata', {
        method: "GET", 
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data['Market-Open'] == true) {
            document.getElementById('portfoliodata').innerText = `$${data['Portfolio-Value']}`;
        } else {
            document.getElementById('portfoliodata').innerText = `$${data['Portfolio-Value']} (Closed)`;
        }
    })
}
function searchWebsite(event) {
    if (event.key == "Enter") {
        const inputValue = document.getElementById('searchbar').value;
        website = `https://www.google.com/search?q= ${inputValue}`;
        document.getElementById('searchbar').value = "";
        document.activeElement.blur();
        window.open(website);
    }
}
function askAI(event) {
    if (event.key == "Enter") {
        const input = document.getElementById("ask-ai").value;
        if (input.trim() == "") {
            document.getElementById("ask-ai").value = " ";
            return " "
        } else {
            document.getElementById('ask-ai').value = "Loading Response...";
            fetch(`https://api.cohere.com/v1/chat`, {
                method: "POST",
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    "Authorization": `bearer ${CohereAPI}`
                },
                body: JSON.stringify({
                    "chat_history": chat_history,
                    "message": `${input}`,
                    "connectors": [{"id": "web-search"}]
                })
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('ask-ai').value = `${data['text']}`;
                chat_history = data['chat_history']
                document.getElementById('ask-ai').style.color = '#65aa70';
            })
        }
    } else if (event.key != "Control" && event.key != "Shift" && event.key != "Alt") {
        document.getElementById('ask-ai').style.color = '#ff8400';
    }
}
function getDateTime() {
    const Weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const Datetime = new Date()
    let Hours
    if (Datetime.getHours()>12) {
        Hours = Datetime.getHours() - 12
    } else {
        Hours = Datetime.getHours()
    }
    let Seconds 
    if (Datetime.getSeconds()<10) {
        Seconds = "0" + Datetime.getSeconds()
    } else {
        Seconds = Datetime.getSeconds()
    }
    let Minutes 
    if (Datetime.getMinutes()<10) {
        Minutes = "0" + Datetime.getMinutes()
    } else {
        Minutes = Datetime.getMinutes()
    }
    const DatetimeText = `${Weekdays[Datetime.getDay()]} ${Datetime.getMonth()+1}/${Datetime.getDate()}/${Datetime.getFullYear()}, ${Hours}:${Minutes}:${Seconds}`
    document.getElementById('datetime').innerText = DatetimeText;
}

function deleteAiText() {
    document.getElementById('ask-ai').value = "";
}

function copyAiText() {
    navigator.clipboard.writeText(document.getElementById('ask-ai').value);
}

function switchToSchoolBookmarks() {
    console.log("Switching to school")
    document.getElementById('active-bookmarks').innerHTML = `
    <a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox" target="_blank" rel="noopener noreferrer">Gmail</a>
    <a href="https://classroom.google.com/" target="_blank" rel="noopener noreferrer">Google Classroom</a>
    <a href="https://mvla.instructure.com/" target="_blank" rel="noopener noreferrer">Canvas Instructure</a>
    <a href="https://mvla.aeries.net/student/Dashboard.aspx" target="_blank" rel="noopener noreferrer">Aeries Portal</a>
    <a href="https://teachmore.org/losaltos/students/index.php" target="_blank" rel="noopener noreferrer">Teachmore</a>
    <a href="https://drive.google.com/drive/home" target="_blank" rel="noopener noreferrer">Google Drive</a>
    `;
    document.getElementById("current-bookmark").style.color = 'rgba(255, 255, 255, 0.695)';
    document.getElementById("current-bookmark").innerText = "School";
}
function switchToPersonalBookmarks() {
    console.log("Switching to personal")
    document.getElementById('active-bookmarks').innerHTML = `
    <a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox" target="_blank" rel="noopener noreferrer">Gmail</a>
    <a href="https://www.netflix.com/" target="_blank" rel="noopener noreferrer">Netflix</a>
    <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">Youtube</a>
    <a href="https://digital.fidelity.com/ftgw/digital/portfolio/summary" target="_blank" rel="noopener noreferrer">Fidelity</a>
    <a href="https://calendar.google.com/calendar/u/0/r" target="_blank" rel="noopener noreferrer">Google Calendar</a>
    <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a>
    <a href="https://www.amazon.com" target="_blank" rel="noopener noreferrer">Amazon</a>
    <a href="vscode:://app" target="_blank" rel="noopener noreferrer">VS Code</a>
    <a href="spotify:://app" target="_blank" rel="noopener noreferrer">Spotify</a>
    `;
    document.getElementById("current-bookmark").style.color = 'rgba(255, 255, 255, 0.695)';
    document.getElementById("current-bookmark").innerText = "Personal";
}
function syncTodoist() {
    console.log("Syncing todoist");
    fetch("/synctodoist")
    .then(response => response.text())
    .then(data => {
        alert(`Todoist Sync: ${data}`)
    });
}
function Test() {
    console.log("activated");
}

function TodoistTasks() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    try {
        fetch("https://api.todoist.com/rest/v2/tasks", {
            headers: {
                "Authorization": `Bearer ${TodoistAPI}`,
            }
        })
        .then(response => response.json())
        .then(data => {
            const tasks = [];
            data.sort(function(a, b) {
                try {
                    const b_date_list = b['due']['date'].split('-');
                    const b_date = new Date(b_date_list[0], b_date_list[1]-1, b_date_list[2]);
                    try {
                        const a_date_list = a['due']['date'].split('-');
                        const a_date = new Date(a_date_list[0], a_date_list[1]-1, a_date_list[2]);
                        if (a_date > b_date) {
                            return 1
                        } else if (b_date > a_date) {
                            return -1
                        } else {
                            return 0
                        }
                    } catch (error) {
                            return 1
                    }
                } catch (error) {
                    return -1
                }
            });
            for (task of data) {
                const content = task['content'].trim()
                let content_parsed;
                if (content[content.length-1] == ".") {
                    content_parsed = content.slice(0, -1);
                } else {
                    content_parsed = content;
                }
                try {
                    const d = task['due']['date'].split('-');
                    const date = new Date(d[0], d[1]-1, d[2])
                    if (date > new Date()) {
                        if (d[0] == "2024") {
                            tasks.push(`${content_parsed}: ${months[date.getMonth()]} ${date.getDate()}`);
                        } else {
                            tasks.push(`${content_parsed}: ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`);
                        }
                    } else {
                        if (d[0] == "2024") {
                            tasks.push(`<b>${content_parsed}: ${months[date.getMonth()]} ${date.getDate()}</b>`);
                        } else {
                            tasks.push(`<b>${content_parsed}: ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}</b>`);
                        }
                    }
                } catch (error) {
                    tasks.push(content_parsed);
                }
                
            }
            var task_html = [];
            for (task of tasks) {
                task_html.push(`<div>${task}</div>`)
            };
            const finished_html = task_html.join('\n');
            document.getElementById('tasks').innerHTML = `${finished_html}`;
        });
    } catch(err) {
    }
}
function getBackgrounds() {
    fetch("backgrounds.json")
    .then(response => response.json())
    .then(data => {
        const files = data;
        Backgrounds = files;
        window.CurrentBG = Math.floor(Math.random() * Backgrounds.length);
        document.getElementById('body').style.backgroundImage = `url(/assets/Backgrounds/${Backgrounds[CurrentBG]})`;
        for (image of Backgrounds) {
            document.getElementById("head").innerHTML += `<link rel="preload" href="/assets/Backgrounds/${image}" as="image">`;
        }
    });
}
function swapBackground() {
    if (swappingBackground == true) {
        console.log("Attempting to switch Background")
        if (CurrentBG + 1 == Backgrounds.length) {
            CurrentBG = 0;
            document.getElementById('body').style.backgroundImage = `url(/assets/Backgrounds/${Backgrounds[CurrentBG]})`;
        } else {
            CurrentBG += 1;
            document.getElementById('body').style.backgroundImage = `url(/assets/Backgrounds/${Backgrounds[CurrentBG]})`;
        };
    }
}
function switchSwapBackground() {
    if (swappingBackground == true) {
        swappingBackground = false;
        document.getElementById("Background-Button").innerText = "Swap Background (On)";
        console.log("Swapping Background" + swappingBackground);
    } else {
        swappingBackground = true;
        document.getElementById("Background-Button").innerText = "Swap Background (Off)";
        console.log("Swapping Background" + swappingBackground);
    };
    swapBackground()
}
function keepBackground(event) {
    console.log(event.key)
    if (event.key == "b") {
        switchSwapBackground()
    }
}
function handleCookie() {
    if (TodoistAPI != "" && CohereAPI != "") {
        const expires = new Date()
        expires.setFullYear('2100')
        document.cookie = `${TodoistAPI}|${CohereAPI}; expires=${expires};`
        if (!taskAlreadyActivated) {
            TodoistTasks();
            setInterval(TodoistTasks, 20000);
            taskAlreadyActivated = true;
        }
    } 
    const keys = document.cookie.split(";")[0].split("|");
    if (keys.length == 2) {
        TodoistAPI = keys[0];
        CohereAPI = keys[1];
        if (!taskAlreadyActivated) {
            TodoistTasks()
            setInterval(TodoistTasks, 20000);
            taskAlreadyActivated = true;
        }
    } else {
        console.log("API Keys not Set")
    }
}
function inputCohere() {
    CohereAPI = prompt("Please Input a Cohere API Key").trim();
}
function inputTodoist() {
    TodoistAPI = prompt("Please Input a Todoist API Key").trim();
}
console.log("Activated");
var taskAlreadyActivated = false;
var TodoistAPI = "";
var CohereAPI = "";
var Backgrounds = [];
var swappingBackground = true;
var chat_history = [];
getBackgrounds();
handleCookie();
//getPortfolioData();
getDateTime();
switchToSchoolBookmarks()
document.getElementById('searchbar').addEventListener('keydown', searchWebsite);
document.getElementById('ask-ai').addEventListener('keydown', askAI);
document.addEventListener('keydown', keepBackground)
//setInterval(getPortfolioData, 5000);
setInterval(getDateTime, 1000);
setInterval(swapBackground, 5000);
setInterval(handleCookie, 1000);
let Breaks
getBreaks().then((result) => {
    Breaks = result
    getBellData()
})
setInterval(getBellData, 1000)