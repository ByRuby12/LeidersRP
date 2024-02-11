const multas = [
    {
        numero: '1.1',
        descripcion: 'Uso excesivo del claxón',
        precio: 100,
        mesesPrision: 0
    },
    {
        numero: '1.2',
        descripcion: 'Giro indebido',
        precio: 50,
        mesesPrision: 0
    },
    {
        numero: '1.3',
        descripcion: 'Circular en sentido contrario',
        precio: 150,
        mesesPrision: 0
    },
    {
        numero: '1.4',
        descripcion: 'Estacionar en zonas no habilitadas y obstruir la circulación',
        precio: 150,
        mesesPrision: 0
    },
    {
        numero: '1.5',
        descripcion: 'Ignorar las señales de tránsito',
        precio: 100,
        mesesPrision: 0
    },
    {
        numero: '1.6',
        descripcion: 'Saltarse un semáforo',
        precio: 50,
        mesesPrision: 0
    },
    {
        numero: '1.7',
        descripcion: 'No ceder el paso a vehiculos de emergencia',
        precio: 250,
        mesesPrision: 0
    },
    {
        numero: '1.8',
        descripcion: 'Realizar adelantamiento indebido',
        precio: 100,
        mesesPrision: 0
    },
    {
        numero: '1.9',
        descripcion: 'Circular marcha atrás',
        precio: 150,
        mesesPrision: 0
    },
    {
        numero: '1.10',
        descripcion: 'Ignorar señales de los agentes que regulan la circulación',
        precio: 300,
        mesesPrision: 0
    },
    {
        numero: '1.11',
        descripcion: 'Saltarse / omitir un control de tráfico',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '1.12',
        descripcion: 'Conducir un vehiculo en malas condiciones',
        precio: 150,
        mesesPrision: 0
    },
    {
        numero: '1.13',
        descripcion: 'Exceso de velocidad en vías urbanas',
        precio: 250,
        mesesPrision: 10
    },
    {
        numero: '1.14',
        descripcion: 'Conducción temeraria',
        precio: 300,
        mesesPrision: 10
    },
    {
        numero: '1.15',
        descripcion: 'Exceso de velocidad en vías secundarias',
        precio: 250,
        mesesPrision: 10
    },
    {
        numero: '1.16',
        descripcion: 'Conducir bajo los efectos de drogas/alcohol',
        precio: 500,
        mesesPrision: 10
    },
    {
        numero: '1.17',
        descripcion: 'Circular por zonas no habilitadas para ello',
        precio: 350,
        mesesPrision: 0
    },
    {
        numero: '1.18',
        descripcion: 'Circular sin el casco con motocicleta',
        precio: 100,
        mesesPrision: 0
    },
    {
        numero: '1.18.1',
        descripcion: 'Circular sin licencia de conducir',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '1.19',
        descripcion: 'Circular marcha atrás con el vehiculo',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '1.20',
        descripcion: 'Conducir sin papeles del coche',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '1.21',
        descripcion: 'Derrapar con la rueda del vehiculo en via pública',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '1.22',
        descripcion: 'Aparcar en doble fila',
        precio: 200,
        mesesPrision: 0
    },
    {
        numero: '1.23',
        descripcion: 'Aparcar en Zona de Minusválidos',
        precio: 500,
        mesesPrision: 10
    },
    {
        numero: '1.24',
        descripcion: 'Chocarse contra un vehiculo aposta',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '1.25',
        descripcion: 'No tener documentación (DNI)',
        precio: 1000,
        mesesPrision: 10
    },
    {
        numero: '1.26',
        descripcion: 'Atropellar a un civil',
        precio: 1500,
        mesesPrision: 15
    },
    {
        numero: '2.1',
        descripcion: 'Alteración del orden público',
        precio: 700,
        mesesPrision: 0
    },
    {
        numero: '2.2',
        descripcion: 'Racismo',
        precio: 700,
        mesesPrision: 0
    },
    {
        numero: '2.3',
        descripcion: 'Faltas de respeto a otro civil',
        precio: 100,
        mesesPrision: 0
    },
    {
        numero: '2.4',
        descripcion: 'Dañar mobiliario urbano (dependiendo de los daños)',
        precio: 1000,
        mesesPrision: 0
    },
    {
        numero: '2.5',
        descripcion: 'Acoso psicológico',
        precio: 6000,
        mesesPrision: 5
    },
    {
        numero: '2.6',
        descripcion: 'Amenaza de muerte a un civil',
        precio: 1500,
        mesesPrision: 5
    },
    {
        numero: '2.7',
        descripcion: 'Suplantación de identidad',
        precio: 3000,
        mesesPrision: 0
    },
    {
        numero: '2.8',
        descripcion: 'Circular por la vía pública con el rostro oculto',
        precio: 700,
        mesesPrision: 5
    },
    {
        numero: '2.9',
        descripcion: 'Circular en vía pública desnudo o semi-desnudo',
        precio: 1000,
        mesesPrision: 0
    },
    {
        numero: '2.10',
        descripcion: 'Circular en vían pública sin camiseta',
        precio: 120,
        mesesPrision: 0
    },
    {
        numero: '2.11',
        descripcion: 'Acoso sexual',
        precio: 30000,
        mesesPrision: 60
    },
    {
        numero: '2.12',
        descripcion: 'Violar una orden de alejamiento con sentendia firme',
        precio: 25000,
        mesesPrision: 40
    },
    {
        numero: '2.13',
        descripcion: 'Negativa a identificarse',
        precio: 1000,
        mesesPrision: 10
    },
    {
        numero: '2.14',
        descripcion: 'Obstrucción a la justicia',
        precio: 2500,
        mesesPrision: 10
    },
    {
        numero: '2.15',
        descripcion: 'Fraude o engaño',
        precio: 3000,
        mesesPrision: 10
    },
    {
        numero: '3.1',
        descripcion: 'Posesión de estupefacientes según cantidades: Consumo propio: Hasta 5 unidades. Más de 10 unidades se considera tráfico de drogas.',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '3.2',
        descripcion: 'Posesión de estupefacientes (Marihuana / Metanfetamina / Cocaina / Hachís) 100 x unidad una vez superadas las 10 unidades',
        precio: 100,
        mesesPrision: 15
    },
    {
        numero: '3.3',
        descripcion: 'Retirada de estupefacientes de consumo propio en caso de que supere la cantidad reglamentada. Retirada de estupefacientes de consumo propio en caso de que supere la cantidad reglamentaria',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '3.4',
        descripcion: 'Posesión de materia prima para la fabricación de drogas o de armas. La materia prima usada para la fabricación de drogas o armas serán penadas según la droga o arma que produzcan tal y como se indica en todos los precios de los articulos',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '3.5',
        descripcion: 'Consumo de estupefacientes en vía pública',
        precio: 750,
        mesesPrision: 10
    },
    {
        numero: '4.1',
        descripcion: 'Serán considerados como tal, las armas de fuego que no se consigan en una tienda autorizada. El mal uso de las armas de fuego letales conlleva una sanción equivalente a la del articulo 4.4 y la retirada de la licencia de armas',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '4.2',
        descripcion: 'Queda totalmente prohibido, por parte de los civiles, portar una pistolera como atuendo de modo decorativo',
        precio: 500,
        mesesPrision: 0
    },
    {
        numero: '4.3',
        descripcion: 'Posesión de arma blanca: Son considerados como tal, aquellas armas de filo cortante que no se vendan legalmente. Armas blancas susceptibles de ser usados como arma ilegal: Cuchillo, Bate de besibol, Palo de Golf, Botella rota, Linterna, Machete...',
        precio: 1500,
        mesesPrision: 0
    },
    {
        numero: '4.4',
        descripcion: 'Portar pistola de bajo calibre',
        precio: 3500,
        mesesPrision: 10
    },
    {
        numero: '4.5',
        descripcion: 'Portar armas automáticas de bajo calibre / medio',
        precio: 6000,
        mesesPrision: 10
    },
    {
        numero: '4.6',
        descripcion: 'Portar armas automáticas de alto calibre',
        precio: 15000,
        mesesPrision: 15
    },
    {
        numero: '4.7',
        descripcion: 'Tráfico de armas',
        precio: 15000,
        mesesPrision: 25
    },
    {
        numero: '4.8',
        descripcion: 'Objetos: Podrán ser retiradas los objetos que el agente justifique que puedan o hayan sido utilizados para cometer delitos',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '4.9',
        descripcion: 'Atentado terrorista',
        precio: 100000,
        mesesPrision: 120
    },
    {
        numero: '4.10',
        descripcion: 'Atentar contra la vida o integridad física de varias personas y/o funcionarios públicos mediante la organización armada de varios individuos',
        precio: 100000,
        mesesPrision: 240
    },
    {
        numero: '5.1',
        descripcion: 'Agresión a otro individuo',
        precio: 700,
        mesesPrision: 10
    },
    {
        numero: '5.2',
        descripcion: 'Intento de agresión a civil',
        precio: 500,
        mesesPrision: 10
    },
    {
        numero: '5.3',
        descripcion: 'Intento de secuestro',
        precio: 2500,
        mesesPrision: 15
    },
    {
        numero: '5.4',
        descripcion: 'Secuestro a un individuo',
        precio: 4000,
        mesesPrision: 20
    },
    {
        numero: '5.5',
        descripcion: 'Intento de homicidio a un civil sin el uso de armas',
        precio: 1500,
        mesesPrision: 10
    },
    {
        numero: '5.6',
        descripcion: 'Intento de homicidio a un civil con uso de armas de cualquier índole',
        precio: 3000,
        mesesPrision: 20
    },
    {
        numero: '5.7',
        descripcion: 'Intento de homicidio a múltiples civiles sin el uso de armas',
        precio: 3000,
        mesesPrision: 15
    },
    {
        numero: '5.8',
        descripcion: 'Intento de homicidio a múltiples civiles con uso de armas de cualquier índole: 4000 por cada civil / 20 Meses no acumulables',
        precio: 4000,
        mesesPrision: 20
    },
    {
        numero: '6.1',
        descripcion: 'Amenazas, desobediencia e inultos: Tras la primera omisión de la orden de un funcionario de policía, se le pondrá acumular al reo el monto económico después del primer aviso por cada falta de respeto o desataco',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '6.2',
        descripcion: 'Insultar a un funcionario pública (No acumluable más de 10 veces). Los meses tampoco son acumulativos',
        precio: 400,
        mesesPrision: 10
    },
    {
        numero: '6.3',
        descripcion: 'Agresión o amenaza de muerte a un funcionario (No acumulable más de 5 veces). Los meses tampoco son acumulativos',
        precio: 2000,
        mesesPrision: 15
    },
    {
        numero: '6.4',
        descripcion: 'Desacato',
        precio: 700,
        mesesPrision: 10
    },
    {
        numero: '6.5',
        descripcion: 'Resistirse al arresto',
        precio: 800,
        mesesPrision: 10
    },
    {
        numero: '6.6',
        descripcion: 'Huir de la justicia',
        precio: 1000,
        mesesPrision: 10
    },
    {
        numero: '6.7',
        descripcion: 'Falso testimonio',
        precio: 500,
        mesesPrision: 5
    },
    {
        numero: '6.8',
        descripcion: 'Usurpación de funciones públicas',
        precio: 10000,
        mesesPrision: 15
    },
    {
        numero: '6.9',
        descripcion: 'Secuestro a un funcionario público',
        precio: 6000,
        mesesPrision: 30
    },
    {
        numero: '6.10',
        descripcion: 'Amenazar a un funcionario público a mano armada',
        precio: 4500,
        mesesPrision: 20
    },
    {
        numero: '6.11',
        descripcion: 'Intento de homicidio a un funcionario público',
        precio: 8500,
        mesesPrision: 30
    },
    {
        numero: '6.12',
        descripcion: 'Homicidio a un funcionario',
        precio: 25000,
        mesesPrision: 40
    },
    {
        numero: '6.13',
        descripcion: 'Homicidio a múltiples funcionarios',
        precio: 55000,
        mesesPrision: 60
    },
    {
        numero: '6.14',
        descripcion: 'Robo de secretos de estado',
        precio: 0,
        mesesPrision: 240
    },
    {
        numero: '6.15',
        descripcion: 'Cada multa impagada se acumulará en la base de datos de la policía. Si se superan los 50.000€ impagados, la polcía podrá requisar bienes personales con tal de saldar las multas impagadas',
        precio: 0,
        mesesPrision: 0
    },
    {
        numero: '7.1',
        descripcion: 'Robo de vehiculo',
        precio: 700,
        mesesPrision: 10
    },
    {
        numero: '7.2',
        descripcion: 'Robo con intimidación a un civil',
        precio: 1000,
        mesesPrision: 10
    },
    {
        numero: '7.3',
        descripcion: 'Robo con violencia a un civil',
        precio: 1200,
        mesesPrision: 10
    },
    {
        numero: '7.4',
        descripcion: 'Robo de petenencias en residencia privada',
        precio: 500,
        mesesPrision: 10
    },
    {
        numero: '7.5',
        descripcion: 'Allamiento de morada o propiedad privada',
        precio: 350,
        mesesPrision: 10
    },
    {
        numero: '7.6',
        descripcion: 'Robo Mayor (Fleeca, Pacific Standard, Laboratorios Humane, Casino, Barco)',
        precio: 30000,
        mesesPrision: 30
    },
    {
        numero: '7.7',
        descripcion: 'Robo Intermedio (Ammunation, Ponsonbys)',
        precio: 15000,
        mesesPrision: 20
    },
    {
        numero: '7.8',
        descripcion: 'Robo Menor (Licoleria, Badulake, ATM, Casas, Tienda de Ropa, Peluqueria, Tatto, Gasolinera)',
        precio: 5000,
        mesesPrision: 10
    }
];

export { multas };