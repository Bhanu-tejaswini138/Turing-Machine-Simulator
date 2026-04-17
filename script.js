/**
 * Turing Machine Simulator - Simulation Logic
 * Designed for Theory of Computation Project
 */

const PROGRAMS = {
    increment: {
        name: "Binary Incrementer",
        desc: "Adds 1 to a binary number. Logic: Moves to the end of the string, then carries the 1 from right to left.",
        initialTape: "1011",
        initialState: 'START',
        blank: '_',
        transitions: [
            { from: 'START', read: '0', to: 'START', write: '0', move: 'R' },
            { from: 'START', read: '1', to: 'START', write: '1', move: 'R' },
            { from: 'START', read: '_', to: 'INC', write: '_', move: 'L' },
            { from: 'INC', read: '1', to: 'INC', write: '0', move: 'L' },
            { from: 'INC', read: '0', to: 'HALT', write: '1', move: 'S' },
            { from: 'INC', read: '_', to: 'HALT', write: '1', move: 'S' }
        ]
    },
    palindrome: {
        name: "Palindrome Checker",
        desc: "Verifies if the tape input is a binary palindrome. Matches outer symbols and clears them.",
        initialTape: "101101",
        initialState: 'START',
        blank: '_',
        transitions: [
            { from: 'START', read: '0', to: 'L0', write: '_', move: 'R' },
            { from: 'START', read: '1', to: 'L1', write: '_', move: 'R' },
            { from: 'START', read: '_', to: 'ACCEPT', write: '_', move: 'S' },
            { from: 'L0', read: '0', to: 'L0', write: '0', move: 'R' },
            { from: 'L0', read: '1', to: 'L0', write: '1', move: 'R' },
            { from: 'L0', read: '_', to: 'C0', write: '_', move: 'L' },
            { from: 'C0', read: '0', to: 'RET', write: '_', move: 'L' },
            { from: 'C0', read: '_', to: 'ACCEPT', write: '_', move: 'S' },
            { from: 'C0', read: '1', to: 'REJECT', write: '1', move: 'S' },
            { from: 'L1', read: '0', to: 'L1', write: '0', move: 'R' },
            { from: 'L1', read: '1', to: 'L1', write: '1', move: 'R' },
            { from: 'L1', read: '_', to: 'C1', write: '_', move: 'L' },
            { from: 'C1', read: '1', to: 'RET', write: '_', move: 'L' },
            { from: 'C1', read: '_', to: 'ACCEPT', write: '_', move: 'S' },
            { from: 'C1', read: '0', to: 'REJECT', write: '0', move: 'S' },
            { from: 'RET', read: '0', to: 'RET', write: '0', move: 'L' },
            { from: 'RET', read: '1', to: 'RET', write: '1', move: 'L' },
            { from: 'RET', read: '_', to: 'START', write: '_', move: 'R' }
        ]
    },
    anbn: {
        name: "L = {aⁿbⁿ | n ≥ 0}",
        desc: "Checks if the input has an equal number of 'a's followed by 'b's.",
        initialTape: "aaabbb",
        initialState: 'q0',
        blank: '_',
        transitions: [
            { from: 'q0', read: 'a', to: 'q1', write: 'X', move: 'R' },
            { from: 'q0', read: 'Y', to: 'q3', write: 'Y', move: 'R' },
            { from: 'q0', read: '_', to: 'ACCEPT', write: '_', move: 'S' },
            { from: 'q1', read: 'a', to: 'q1', write: 'a', move: 'R' },
            { from: 'q1', read: 'Y', to: 'q1', write: 'Y', move: 'R' },
            { from: 'q1', read: 'b', to: 'q2', write: 'Y', move: 'L' },
            { from: 'q2', read: 'a', to: 'q2', write: 'a', move: 'L' },
            { from: 'q2', read: 'Y', to: 'q2', write: 'Y', move: 'L' },
            { from: 'q2', read: 'X', to: 'q0', write: 'X', move: 'R' },
            { from: 'q3', read: 'Y', to: 'q3', write: 'Y', move: 'R' },
            { from: 'q3', read: '_', to: 'ACCEPT', write: '_', move: 'S' }
        ]
    },
    unaryAdd: {
        name: "Unary Addition",
        desc: "Adds two blocks of 1s separated by a '+'. Example: 11+111 = 11111.",
        initialTape: "111+1111",
        initialState: 'q0',
        blank: '_',
        transitions: [
            { from: 'q0', read: '1', to: 'q0', write: '1', move: 'R' },
            { from: 'q0', read: '+', to: 'q1', write: '1', move: 'R' },
            { from: 'q1', read: '1', to: 'q1', write: '1', move: 'R' },
            { from: 'q1', read: '_', to: 'q2', write: '_', move: 'L' },
            { from: 'q2', read: '1', to: 'HALT', write: '_', move: 'S' }
        ]
    }
};

class TuringMachine {
    constructor() {
        this.tape = [];
        this.headPos = 0;
        this.currentState = '';
        this.steps = 0;
        this.history = [];
        this.isHalted = false;
        this.isPlaying = false;
        this.playInterval = null;
        this.currentProgramKey = 'increment';

        this.bindDOM();
        this.initEventListeners();
        this.loadProgram('increment');
    }

    bindDOM() {
        this.dom = {
            tape: document.getElementById('tape-cells'),
            state: document.getElementById('stat-state'),
            steps: document.getElementById('stat-steps'),
            result: document.getElementById('stat-result'),
            input: document.getElementById('tape-input'),
            speed: document.getElementById('speed-range'),
            select: document.getElementById('program-select'),
            desc: document.getElementById('program-desc'),
            ruleBody: document.getElementById('rule-body'),
            console: document.getElementById('formal-console'),
            playBtn: document.getElementById('btn-play')
        };
    }

    initEventListeners() {
        this.dom.select.addEventListener('change', (e) => this.loadProgram(e.target.value));
        document.getElementById('btn-load').addEventListener('click', () => this.boot(this.dom.input.value));
        document.getElementById('btn-step').addEventListener('click', () => this.step());
        document.getElementById('btn-back').addEventListener('click', () => this.stepBack());
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlayback());
        document.getElementById('btn-reset').addEventListener('click', () => this.loadProgram(this.currentProgramKey));
    }

    loadProgram(key) {
        this.currentProgramKey = key;
        const prog = PROGRAMS[key];
        this.dom.desc.textContent = prog.desc;
        this.dom.input.value = prog.initialTape;
        this.boot(prog.initialTape);
        this.renderRules();
    }

    boot(inputString) {
        this.stopPlayback();
        this.tape = inputString.split('');
        this.headPos = 0;
        this.currentState = PROGRAMS[this.currentProgramKey].initialState;
        this.steps = 0;
        this.history = [];
        this.isHalted = false;

        this.dom.console.innerHTML = '';
        this.logSystem('Simulation started');
        this.logSystem(`Current state set to: ${this.currentState}`);
        this.updateUI();
    }

    renderRules() {
        const rules = PROGRAMS[this.currentProgramKey].transitions;
        this.dom.ruleBody.innerHTML = rules.map((r, i) => `
            <tr id="rule-${i}">
                <td>${r.from}</td>
                <td>${r.read}</td>
                <td>${r.write}</td>
                <td>${r.move}</td>
                <td>${r.to}</td>
            </tr>
        `).join('');
    }

    logSystem(msg) {
        const entry = document.createElement('div');
        entry.className = 'log-entry system';
        entry.textContent = msg;
        this.appendLog(entry);
    }

    logAction(rule, oldState) {
        const entry = document.createElement('div');
        entry.className = 'log-entry action';
        entry.textContent = `δ(${oldState}, ${rule.read}) → (${rule.to}, ${rule.write}, ${rule.move})`;
        this.appendLog(entry);
    }

    appendLog(el) {
        this.dom.console.appendChild(el);
        this.dom.console.scrollTop = this.dom.console.scrollHeight;
    }

    step() {
        if (this.isHalted) return;

        const prog = PROGRAMS[this.currentProgramKey];
        const currentSymbol = this.tape[this.headPos] || prog.blank;

        const ruleIdx = prog.transitions.findIndex(t =>
            t.from === this.currentState && t.read === currentSymbol
        );

        if (ruleIdx === -1) {
            this.halt('REJECTED');
            return;
        }

        const rule = prog.transitions[ruleIdx];

        // Save history for Step Backward
        this.history.push({
            tape: [...this.tape],
            headPos: this.headPos,
            state: this.currentState,
            ruleIdx: ruleIdx
        });

        const oldState = this.currentState;
        this.logAction(rule, oldState);

        // Apply Transition
        this.tape[this.headPos] = rule.write;
        if (rule.move === 'R') this.headPos++;
        else if (rule.move === 'L') this.headPos--;

        // Expand Tape
        if (this.headPos < 0) {
            this.tape.unshift(prog.blank);
            this.headPos = 0;
        }
        if (this.headPos >= this.tape.length) {
            this.tape.push(prog.blank);
        }

        this.currentState = rule.to;
        this.steps++;

        if (['HALT', 'ACCEPT', 'FINISHED'].includes(this.currentState)) {
            this.halt('FINISHED');
        } else if (this.currentState === 'REJECT') {
            this.halt('REJECTED');
        }

        this.highlightRule(ruleIdx);
        this.updateUI();
    }

    stepBack() {
        if (this.history.length === 0) return;
        this.stopPlayback();

        const prevState = this.history.pop();
        this.tape = prevState.tape;
        this.headPos = prevState.headPos;
        this.currentState = prevState.state;
        this.steps--;
        this.isHalted = false;

        this.logSystem('Step backward executed');
        this.highlightRule(prevState.ruleIdx);
        this.updateUI();
    }

    highlightRule(idx) {
        document.querySelectorAll('tr.active-rule').forEach(r => r.classList.remove('active-rule'));
        const active = document.getElementById(`rule-${idx}`);
        if (active) {
            active.classList.add('active-rule');
            active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    halt(type) {
        this.isHalted = true;
        this.stopPlayback();
        this.dom.result.textContent = type;
        this.dom.result.className = `result-${type}`;
        this.logSystem(`Simulation halted: ${type}`);
    }

    updateUI() {
        this.dom.state.textContent = this.currentState;
        this.dom.steps.textContent = this.steps;
        if (!this.isHalted) {
            this.dom.result.textContent = 'Running';
            this.dom.result.className = '';
        }

        // Render Tape Window
        this.dom.tape.innerHTML = '';
        const win = 11;
        const start = this.headPos - 5;
        for (let i = start; i < start + win; i++) {
            const cell = document.createElement('div');
            cell.className = `cell ${i === this.headPos ? 'active' : ''}`;
            const symbol = (i >= 0 && i < this.tape.length) ? this.tape[i] : PROGRAMS[this.currentProgramKey].blank;
            cell.textContent = symbol;
            this.dom.tape.appendChild(cell);
        }
    }

    togglePlayback() {
        this.isPlaying ? this.stopPlayback() : this.startPlayback();
    }

    startPlayback() {
        if (this.isHalted) return;
        this.isPlaying = true;
        this.dom.playBtn.textContent = 'Pause';
        const loop = () => {
            if (!this.isPlaying || this.isHalted) return;
            this.step();
            const delay = 1050 - (parseInt(this.dom.speed.value) * 10);
            this.playInterval = setTimeout(loop, delay);
        };
        loop();
    }

    stopPlayback() {
        this.isPlaying = false;
        this.dom.playBtn.textContent = 'Run';
        if (this.playInterval) clearTimeout(this.playInterval);
    }
}

// Global Init
document.addEventListener('DOMContentLoaded', () => {
    window.TM_CONTROLLER = new TuringMachine();
});
