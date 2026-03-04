function getMailConfig() {
    return {
        mail: {
            // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
            // or
            transport: {
                host: process.env.MAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASSWORD,
                },
            },
            defaults: {
                from: `"LIÊN ĐOÀN LAO ĐỘNG TỈNH BẮC NINH" <${process.env.MAIL_FROM}>`,
            },
        }
    };
}

export default () => {
    return getMailConfig();
};
