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

    } catch (error) {

        console.error(error);

    }

}

loadPrediction();

setInterval(
    loadPrediction,
    2000
);