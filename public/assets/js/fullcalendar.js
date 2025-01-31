$(document).ready(function() {

    var userId = $('#user_id').val();
    var apartamentoId = $('#user_apartamento').val();
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        validRange: function(nowDate) {
            return {
                start: nowDate,
            };
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            $.ajax({
                url: '/reservas',
                type: 'GET',
                dataType: 'JSON',
                data: { user_id: userId },
                success: function(response) {
                    console.log(response);
                    var events = response.map(function(reserva) {
                        return {
                            title: reserva.nome,
                            start: reserva.data_reserva,
                            allDay: true
                        };
                    });

                    successCallback(events);
                },
                error: function(error) {
                    console.error('Erro ao buscar as reservas', error);
                    failureCallback(error);
                }
            });
        },
        dateClick: function(info) {
            $.ajax({
                url: '/areas',
                type: 'GET',
                dataType: 'json',
                success: function(response) {

                    var options = {};

                    response.forEach(function(area) {
                        options[area.id_areas_lazer] = area.nome;
                    });

                    Swal.fire({
                        title: 'Escolha uma área de lazer',
                        showDenyButton: true,
                        denyButtonText: 'Cancelar',
                        icon: 'warning',
                        input: 'select',
                        inputOptions: options,
                        inputPlaceholder: 'Selecione uma área de lazer',
                        confirmButtonText: 'Reservar',
                        preConfirm: (selectedArea) => {
                            if (!selectedArea) {
                                Swal.showValidationMessage('Selecione uma área de lazer');
                            }
                            return selectedArea;
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            
                            let selectedAreaId = result.value;
                            let selectedAreaDescricao = options[selectedAreaId];
                            let selectedDate = info.dateStr;

                            if (selectedAreaId && selectedAreaDescricao) {
                                calendar.addEvent({
                                    title: selectedAreaDescricao,
                                    start: selectedDate,
                                    allDay: true
                                });

                                Swal.fire('Reservado!', `Você reservou a área de lazer: ${selectedAreaDescricao}`, 'success');
                                
                                $.ajax({
                                    url: '/reservar',
                                    type: 'POST',
                                    dataType: 'JSON',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        data_reserva: selectedDate,
                                        id_areas_lazer: selectedAreaId,
                                        id_morador: userId,
                                        id_apartamento: apartamentoId,
                                        valor: 100.00,
                                        pago: 0
                                    }),
                                    success: function(response) {
                                        console.log('Reserva registrada com sucesso', response);
                                    },
                                    error: function(error) {
                                        console.error('Erro ao registrar a reserva', error);
                                    }
                                });
                            }
                        }
                    });
                },
                error: function() {
                    Swal.fire('Erro', 'Não foi possível carregar as áreas de lazer.', 'error');
                }
            });
        }
    });
    calendar.render();
});
