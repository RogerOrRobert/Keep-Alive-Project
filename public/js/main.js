(function ($, window, document) {
    $(async function () {
        const socket = io();

        function getStatusBadge(status) {
            switch (status) {
                case "stopped":
                    return `<span class="badge badge-danger">${status}</span>`;
                case "online":
                    return `<span class="badge badge-success">${status}</span>`;
                default:
                    return `<span class="badge badge-default">${status}</span>`;
            }
        }

        function getActionButton(status) {
            if (status === "online") {
                return `
                <button type="button" class="btn btn-outline-danger" data-action="stop" title="stop">
                    <i class="bi bi-pause-circle"></i>
                </button>
                <button type="button" class="btn btn-outline-warning" data-action="tail-log" title="show log">
                    <i class="bi bi-terminal"></i>
                </button>
                <button type="button" name="isEnabled" id="container-save" class="btn btn-secondary" data-action="save" title="save">
                    <i class="bi bi-save"></i> 
                </button>
                `;
            }
            return `
                <button type="button" class="btn btn-outline-primary" data-action="start" title="start">
                    <i class="bi bi-play-circle"></i>
                </button>
                <button type="button" name="isEnabled" id="container-save" class="btn btn-secondary" data-action="save" title="save">
                    <i class="bi bi-save"></i> 
                </button>
            `;
        }

        $(document).ready(function () {
            function saved() {
                return `
                    <button type="button" name="isEnabled" id="button-save" class="btn btn-primary" data-action="save" title="save" color="dark">
                        <i class="bi bi-save" color="dark"></i> 
                    </button>
                `;
            }

            // Add the button to the element with the id "container"
            $('.container').append(saved());
        });


        async function updateMinersStatus() {
            const miners = await fetch('/miners')
                .then(res => res.json())
                .then(data => data)
                .catch(err => {
                    console.log('Error POST to miners', err)
                })

            const trs = [];
            for (const miner of miners) {
                trs.push(`
                    <tr id="${miner.name}">
                        <td>${miner.name}</td>
                        <td>${getStatusBadge(miner.pm2_env.status)}</td>
                        <td>
                            <div class="btn-group">
                                <button type="button" class="btn btn-default btn-sm">
                                CPU: ${miner.monit ? miner.monit.cpu : 'N/A'}
                                </button>
                                <button type="button" class="btn btn-default btn-sm">
                                RAM: ${miner.monit ? (miner.monit.memory / (1024 * 1024)).toFixed(1) + ' MB' : 'N/A'}
                                </button>
                            </div>
                        </td>
                        <td>
                            ${getActionButton(miner.pm2_env.status)}
                            <button type="button" class="btn btn-outline-success" data-action="restart" title="restart">
                            <i class="bi bi-arrow-repeat"></i>
                            </button>
                        </td>
                    </tr>
                `);
            }

            $('#tbl-miners tbody').html(trs.join(''));
        }

        function showStdLog(process) {
            const $console = $('#console');
            $console.empty();
            socket.removeAllListeners();

            socket.on(`${process}:out_log`, (procLog) => {
                $console.append(`<p id="console-text">${procLog.data}</p>`);
                $('#console-background').animate({ scrollTop: $console[0].scrollHeight + 1000 }, 500);
            });
        }

        updateMinersStatus();

        setInterval(() => {
            updateMinersStatus();
        }, 15 * 1000);

        async function allEnabled() {
            try {
                const response = await fetch('/getEnableds');
                const data = await response.json();

                console.log('Current state:', data.estado);

                if (response.ok) {
                    console.log("Project saved successfully.");
                    await saveProject();
                } else {
                    console.error("Not all container enables are set to true.");
                    await clearProjectDump();
                }
            } catch (error) {
                console.error("There was a problem with the Fetch request:", error.message);
            }
        }

        async function saveProject() {
            return new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec('pm2 save', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error saving project: ${error.message}`);
                        reject(error);
                    } else {
                        console.log(`Project saved: ${stdout}`);
                        resolve(stdout);
                    }
                });
            });
        }

        async function clearProjectDump() {
            return new Promise((resolve, reject) => {
                const { exec } = require('child_process');
                exec('pm2 cleardump', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error clearing project dump: ${error.message}`);
                        reject(error);
                    } else {
                        console.log(`Cleanup process executed: ${stdout}`);
                        resolve(stdout);
                    }
                });
            });
        }

        let status = 'stopped'
        $(document).on('click', 'button', async function () {
            const self = $(this);
            const action = self.data('action');
            const process = self.parents('tr').attr('id');

            const configFile = 'src/aplications.json';
            // self.addClass('btn-save-original');
            if (!action) {
                return;
            }
            if (self.prop('disabled')) {
                return; // Exits the function if the button is disabled
            }

            if (action && process && ['start', 'stop', 'restart'].indexOf(action) >= 0) {
                try {
                    const response = await fetch(`/miners/${process}/${action}`, { method: 'PUT' });
                    const data = await response.json();
                    if (response.status !== 200) {
                        throw new Error(data.message);
                    }
                    updateMinersStatus();
                } catch (error) {
                    alert(error.message);
                }

                try {
                    const response = await fetch(`/changeContainerState/${process}`, { method: 'POST' });
                    if (status === 'online') {
                        status = 'stopped'
                    } else {
                        status = 'online'
                    }
                    if (response.ok) {
                        console.log(`State changed to ${status}.`);
                        console.log(`Container: ${process}`);
                    } else {
                        console.error("Error saving configuration.");
                        console.log(response);
                        console.log(`Container: ${process}`);
                    }

                } catch (error) {
                    console.error("There was a problem with the Fetch request:", error.message);
                }

            }
            if (action === 'tail-log') {
                showStdLog(process);
            }
            if (action === 'save') {
                allEnabled();
                let isEnabled = false; // Initialize isEnabled as false
                const buttonContainer = document.getElementById('container-save');
                buttonContainer.addEventListener('click', async () => {
                    self.prop('disabled', true);
                    buttonContainer.disabled = true;
                    try {
                        const response = await fetch(`/changeContainerEnable/${process}`, { method: 'POST' });

                        if (response.ok) {
                            console.log("Project saved successfully.");
                            console.log(`Container: ${process}`);
                        } else {
                            console.error("Error saving configuration.");
                            console.log(response);
                            console.log(`Container: ${process}`);
                        }
                        self.removeClass('btn-outline-info').addClass('btn-outline-success').html('<i class="bi bi-check-circle color="green""></i> Saved');
                        buttonContainer.disabled = false;
                    } catch (error) {
                        console.error("There was a problem with the Fetch request:", error.message);
                        buttonContainer.disabled = false;
                    }
                })
                const button = document.getElementById('button-save');
                button.addEventListener('click', async () => {
                    self.prop('disabled', true);
                    isEnabled = !isEnabled;
                    button.disabled = true;
                    console.log("Enabled:", isEnabled);

                    try {
                        const response = await fetch('/setStoreEnable', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                enabled: isEnabled
                            })
                        });
                        if (response.ok) {
                            console.log("Project saved successfully.");
                        } else {
                            console.error("Error saving configuration.");
                        }
                        self.removeClass('btn-outline-info').addClass('btn-outline-success').html('<i class="bi bi-check-circle color="green""></i> Saved');
                        button.disabled = false;
                    } catch (error) {
                        console.error("There was a problem with the Fetch request:", error.message);
                        button.disabled = false;
                    }
                })

            }
            async function reloadSaved() {
                const process = $(this).parents('tr').attr('id');
                try {
                    const saved = await fetch(`/getSaved/${process}`).then(res => res.json());
                    if (saved.enabled === false) {
                        const statusResponse = await fetch('/getStatus').then(res => res.json());
                        const currentStatus = statusResponse.status;
                        if (currentStatus === 'online') {
                            await fetch(`/miners/${process}/stop`, { method: 'PUT' });
                            updateMinersStatus();
                        }
                    }
                } catch (error) {
                    console.error('Error occurred during reloadSaved:', error);
                }

            }
            window.addEventListener('load', async function (event) {
                console.log("hello");
                await reloadSaved();
            })
        });

    });

}(window.jQuery, window, document));
