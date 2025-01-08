let jwtToken = null;

async function login() {
    const usernameOrEmail = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    try {
        const response = await fetch('https://01.kood.tech/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(`${usernameOrEmail}:${password}`),
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            jwtToken = data.jwt;
            errorMessage.textContent = '';
            fetchData();
            document.getElementById("login-form").style.display = 'none';
            document.getElementById("profile").style.display = 'block';
        } else {
            errorMessage.textContent = 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred during login';
    }
}

async function fetchData() {
    const query = `
    {
      user {
        id
        login
      }
      transaction(where: {userId: {_eq: 1}}) {
        amount
        createdAt
      }
      progress(where: {userId: {_eq: 1}}) {
        grade
        path
      }
    }
  `;

    try {
        const response = await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();
        const user = data.data.user;
        const transactions = data.data.transaction;
        const progress = data.data.progress;

        document.getElementById("login").textContent = user.login;
        document.getElementById("xp").textContent = transactions.reduce((acc, txn) => acc + txn.amount, 0);
        document.getElementById("grades").textContent = progress.map(p => p.grade).join(", ");

        generateXPGraph(transactions);
        generatePassFailGraph(progress);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function generateXPGraph(transactions) {
    const svg = document.getElementById("xp-graph");
    svg.innerHTML = '';
    const maxXP = Math.max(...transactions.map(t => t.amount));
    transactions.forEach((transaction, index) => {
        const barHeight = (transaction.amount / maxXP) * 200;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', 60 * index + 10);
        rect.setAttribute('y', 200 - barHeight);
        rect.setAttribute('width', 50);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', 'green');
        svg.appendChild(rect);
    });
}

function generatePassFailGraph(progress) {
    const svg = document.getElementById("pass-fail-graph");
    svg.innerHTML = '';
    const passCount = progress.filter(p => p.grade === 1).length;
    const failCount = progress.filter(p => p.grade === 0).length;

    const total = passCount + failCount;
    const passHeight = (passCount / total) * 200;
    const failHeight = (failCount / total) * 200;

    const passRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    passRect.setAttribute('x', 10);
    passRect.setAttribute('y', 200 - passHeight);
    passRect.setAttribute('width', 150);
    passRect.setAttribute('height', passHeight);
    passRect.setAttribute('fill', 'green');
    svg.appendChild(passRect);

    const failRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    failRect.setAttribute('x', 170);
    failRect.setAttribute('y', 200 - failHeight);
    failRect.setAttribute('width', 150);
    failRect.setAttribute('height', failHeight);
    failRect.setAttribute('fill', 'red');
    svg.appendChild(failRect);
}

function logout() {
    jwtToken = null;
    document.getElementById("login-form").style.display = 'block';
    document.getElementById("profile").style.display = 'none';
}
