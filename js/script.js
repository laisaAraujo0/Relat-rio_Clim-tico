document.addEventListener("DOMContentLoaded", () => {
    listarEstados();
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const inputData = document.getElementById("data");
    inputData.value = new Date().toISOString().split("T")[0];
});

async function listarEstados() {
    const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
    const estados = await response.json();
    const estadoSelect = document.getElementById("estado");

    estados.forEach(estado => {
        const option = document.createElement("option");
        option.value = estado.sigla;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
    });

    estadoSelect.disabled = false;
}

async function listarCidades() {
    const estado = document.getElementById("estado").value;
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`);
    const cidades = await response.json();
    const cidadeSelect = document.getElementById("cidade");
    cidadeSelect.innerHTML = "<option value=''>Selecione a Cidade</option>";

    cidades.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade.nome;
        option.textContent = cidade.nome;
        cidadeSelect.appendChild(option);
    });

    cidadeSelect.disabled = false;
}

async function atualizarDados() {
    const cidade = document.getElementById("cidade").value;
    const estado = document.getElementById("estado").value;
    const periodoColeta = document.getElementById("data").value;
    const apiKey = "ef3335e57535458f80133953240811";

    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cidade}&days=1&aqi=yes&alerts=yes&lang=pt`);
    const data = await response.json();

    const aqi = data.current.air_quality["us-epa-index"];
    let qualidadeAr = "";
    let corStatus = "";

    if (aqi <= 2) {
        qualidadeAr = "Boa";
        corStatus = "green";
    } else if (aqi <= 4) {
        qualidadeAr = "Moderada";
        corStatus = "yellow";
    } else if (aqi <= 6) {
        qualidadeAr = "Ruim";
        corStatus = "orange";
    } else if (aqi <= 8) {
        qualidadeAr = "Muito Ruim";
        corStatus = "red";
    } else {
        qualidadeAr = "Perigosa";
        corStatus = "purple";
    }

    document.getElementById("qualidade-ar-status").textContent = qualidadeAr;
    document.getElementById("qualidade-ar-status").style.backgroundColor = corStatus;

    document.getElementById("qualidade-ar-dados").innerHTML = 
        `<b>CO:</b> ${data.current.air_quality.co.toFixed(2)}<br>
        <b>NO₂:</b> ${data.current.air_quality.no2.toFixed(2)}<br>
        <b>O₃:</b> ${data.current.air_quality.o3.toFixed(2)}<br>
        <b>PM2.5:</b> ${data.current.air_quality.pm2_5.toFixed(2)}<br>
        <b>PM10:</b> ${data.current.air_quality.pm10.toFixed(2)}`;

    const dataFormatada = new Date(data.location.localtime);
    const dia = String(dataFormatada.getDate()).padStart(2, '0');
    const mes = String(dataFormatada.getMonth() + 1).padStart(2, '0');
    const ano = dataFormatada.getFullYear();
    const dataBrasileira = `${dia}/${mes}/${ano}`;

    document.getElementById("info").innerHTML = `No dia <b>${dataBrasileira}</b> às <b>${dataFormatada.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</b> foram coletados dados climáticos de <b>${cidade}</b> - <b>${estado}</b> presentes no quadro abaixo:`;

    const tableBody = document.querySelector("#tabela-previsao");
    tableBody.innerHTML = "";
    data.forecast.forecastday[0].hour.forEach(hour => {
        const row = document.createElement("tr");
        row.innerHTML = 
            `<td>${new Date(hour.time).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${hour.condition.text}</td>
            <td>${hour.chance_of_rain}%</td>
            <td>${hour.temp_c}°C</td>
            <td>${hour.feelslike_c}°C</td>
            <td>${hour.humidity}%</td>
            <td>${hour.gust_kph} Kph</td>`;
        tableBody.appendChild(row);
    });
}

function salvarPDF(elemento, nomeArquivo) {
    const opt = {
        margin: 0.5,
        filename: `${nomeArquivo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(elemento).save();
}