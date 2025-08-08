const getDateRangeFromEndDate_dateFunctions = (data_dates: { date: string },type:number): string[] | Date[] => {
    const endDate = new Date(data_dates.date);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1);
    // Convertir las fechas a formato "YYYY-MM-DD"
    if(type == 1){
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        return [formattedStartDate, formattedEndDate];
    }else{
        return [startDate, endDate];
    }
}
const getDateRange_dateFunctions = (data_dates: { date: string }): Date[] => {
    const endDate = new Date(data_dates.date);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1);

    return [startDate, endDate];
}

export { getDateRangeFromEndDate_dateFunctions,getDateRange_dateFunctions }