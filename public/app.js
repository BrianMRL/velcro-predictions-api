const FULL_DASH = 377;

async function loadPrediction() {

    try {

        const response =
            await fetch('/prediction/live');

        const data =
            await response.json();

        if (!data.active) {

            document
                .getElementById('question')
                .innerText =
                'No hay predicción activa';

            return;
        }

        const option1 =
            data.options[0];

        const option2 =
            data.options[1];

        const total =
            option1.points +
            option2.points;

        const percent1 =
            total > 0
            ? (option1.points / total) * 100
            : 50;

        const percent2 =
            total > 0
            ? (option2.points / total) * 100
            : 50;

        document
            .getElementById('question')
            .innerText =
            data.title;

        document
            .getElementById('status')
            .innerText =
            data.status;

        document
            .getElementById('option1-title')
            .innerText =
            option1.title;

        document
            .getElementById('option2-title')
            .innerText =
            option2.title;

        document
            .getElementById('option1-points')
            .innerText =
            option1.points.toLocaleString();

        document
            .getElementById('option2-points')
            .innerText =
            option2.points.toLocaleString();

        document
            .getElementById('option1-bar')
            .style.width =
            `${percent1}%`;

        document
            .getElementById('option2-bar')
            .style.width =
            `${percent2}%`;

        renderUsers(
            'option1-users',
            option1.predictors
        );

        renderUsers(
            'option2-users',
            option2.predictors
        );

        updateTimer(data);

    } catch (error) {

        console.error(error);

    }

}

function renderUsers(id, users) {

    const container =
        document.getElementById(id);

    container.innerHTML = '';

    users.forEach(user => {

        const div =
            document.createElement('div');

        div.className =
            'predictor';

        div.innerHTML = `
            <strong>${user.user_name}</strong>
            <br>
            ${user.channel_points_used.toLocaleString()} pts
        `;

        container.appendChild(div);

    });

}

function updateTimer(data) {

    const totalTime = 120;

    const now =
        new Date().getTime();

    const created =
        new Date(data.created_at)
        .getTime();

    const elapsed =
        (now - created) / 1000;

    const remaining =
        Math.max(
            0,
            totalTime - elapsed
        );

    document
        .getElementById('timer-text')
        .innerText =
        Math.ceil(remaining);

    const progress =
        remaining / totalTime;

    const offset =
        FULL_DASH * (1 - progress);

    document
        .getElementById('timer-progress')
        .style.strokeDashoffset =
        offset;

}

loadPrediction();

setInterval(
    loadPrediction,
    2000
);