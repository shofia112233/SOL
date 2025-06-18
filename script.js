let processList = [];

function addProcess() {
  const pid = document.getElementById("pid").value.trim();
  const arrival = parseInt(document.getElementById("arrival").value);
  const burst = parseInt(document.getElementById("burst").value);

  if (!pid || isNaN(arrival) || isNaN(burst)) {
    alert("Mohon isi semua field dengan benar.");
    return;
  }

  processList.push({ id: pid, arrival, burst });
  document.getElementById("pid").value = '';
  document.getElementById("arrival").value = '';
  document.getElementById("burst").value = '';

  renderTable();
}

function renderTable() {
  const tbody = document.querySelector("#processTable tbody");
  tbody.innerHTML = "";
  processList.forEach((p, index) => {
    const row = `<tr>
      <td>${p.id}</td>
      <td>${p.arrival}</td>
      <td>${p.burst}</td>
      <td><button onclick="removeProcess(${index})">Hapus</button></td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function removeProcess(index) {
  processList.splice(index, 1);
  renderTable();
}

function toggleQuantum() {
  const algo = document.getElementById("algorithm").value;
  document.getElementById("quantumGroup").style.display = algo === "rr" ? "inline-block" : "none";
}

function runSimulation() {
  if (processList.length === 0) {
    alert("Tambahkan setidaknya satu proses.");
    return;
  }

  const algorithm = document.getElementById("algorithm").value;
  const quantum = parseInt(document.getElementById("quantum").value);
  let result = "";

  switch (algorithm) {
    case "fifo":
      result = fifo(processList);
      break;
    case "sjf":
      result = sjf(processList);
      break;
    case "srtf":
      result = srtf(processList);
      break;
    case "rr":
      if (isNaN(quantum) || quantum < 1) {
        alert("Quantum tidak valid.");
        return;
      }
      result = rr(processList, quantum);
      break;
  }

  document.getElementById("output").textContent = result;
}

// ALGORITHMS

function fifo(procs) {
  const sorted = [...procs].sort((a, b) => a.arrival - b.arrival);
  let time = 0, log = '', totalWT = 0;

  for (let p of sorted) {
    time = Math.max(time, p.arrival);
    log += `${p.id} mulai ${time}, selesai ${time + p.burst}\n`;
    totalWT += time - p.arrival;
    time += p.burst;
  }

  log += `\nRata-rata Waiting Time: ${(totalWT / procs.length).toFixed(2)}`;
  return log;
}

function sjf(procs) {
  let time = 0, completed = 0, log = '', totalWT = 0;
  const done = new Set();

  while (completed < procs.length) {
    const ready = procs.filter(p => p.arrival <= time && !done.has(p.id));
    if (ready.length === 0) {
      time++;
      continue;
    }
    ready.sort((a, b) => a.burst - b.burst);
    const p = ready[0];

    log += `${p.id} mulai ${time}, selesai ${time + p.burst}\n`;
    totalWT += time - p.arrival;
    time += p.burst;
    done.add(p.id);
    completed++;
  }

  log += `\nRata-rata Waiting Time: ${(totalWT / procs.length).toFixed(2)}`;
  return log;
}

function srtf(procs) {
  let time = 0, done = 0, log = '', totalWT = 0;
  const n = procs.length;
  const state = procs.map(p => ({
    ...p,
    remaining: p.burst,
    start: null
  }));

  while (done < n) {
    const ready = state.filter(p => p.arrival <= time && p.remaining > 0);
    if (ready.length === 0) {
      time++;
      continue;
    }

    ready.sort((a, b) => a.remaining - b.remaining);
    const current = ready[0];
    if (current.start === null) current.start = time;

    current.remaining--;
    time++;

    if (current.remaining === 0) {
      log += `${current.id} selesai di ${time}\n`;
      totalWT += time - current.arrival - current.burst;
      done++;
    }
  }

  log += `\nRata-rata Waiting Time: ${(totalWT / n).toFixed(2)}`;
  return log;
}

function rr(procs, quantum) {
  let time = 0, log = '', done = 0;
  const n = procs.length;
  const state = procs.map(p => ({
    ...p,
    remaining: p.burst,
    last: p.arrival,
    start: null,
    wait: 0
  }));
  let queue = [];

  while (done < n || queue.length > 0) {
    procs.forEach(p => {
      if (p.arrival === time) {
        queue.push(state.find(s => s.id === p.id));
      }
   
    }
  }
}
