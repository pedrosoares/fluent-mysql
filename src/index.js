import MysqlDriver from "./mysql_driver";

export const configure = (fluent_configurator) => {
    fluent_configurator.register_driver(new MysqlDriver(fluent_configurator.connections));
};
