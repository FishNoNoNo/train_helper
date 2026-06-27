use clap::{Parser, Subcommand};

/// 12306 火车票抢票助手 —— 命令行接口
#[derive(Parser, Debug, Clone)]
#[command(name = "train_helper", about = "12306 火车票抢票助手", version = "1.0.0")]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand, Debug, Clone)]
pub enum Commands {
    /// 查询车票（按出发站、到达站、日期搜索余票）
    Query {
        /// 出发站名称 (如: 北京, 上海虹桥)
        #[arg(short, long, value_name = "STATION")]
        from: String,

        /// 到达站名称 (如: 上海, 杭州东)
        #[arg(short, long, value_name = "STATION")]
        to: String,

        /// 出发日期 (如: 2026-07-01)
        #[arg(short, long, value_name = "DATE")]
        date: String,

        /// 学生票
        #[arg(long, default_value_t = false)]
        student: bool,

        /// 仅高铁/动车
        #[arg(long, default_value_t = false)]
        gd: bool,

        /// 以 JSON 格式输出 (默认输出可读表格)
        #[arg(long, default_value_t = false)]
        json: bool,
    },

    // TODO: 提交抢票订单
    // Book {
    //     /// 出发站名称
    //     #[arg(short, long)]
    //     from: String,
    //     /// 到达站名称
    //     #[arg(short, long)]
    //     to: String,
    //     /// 出发日期
    //     #[arg(short, long)]
    //     date: String,
    //     /// 车次编号列表 (逗号分隔)
    //     #[arg(short, long, value_delimiter = ',')]
    //     trains: Vec<String>,
    //     /// 乘客序号 (逗号分隔)
    //     #[arg(short, long, value_delimiter = ',')]
    //     passengers: Vec<usize>,
    //     /// 席别 (如: O=二等座, M=一等座)
    //     #[arg(long, default_value = "O")]
    //     seat: String,
    // },

    // TODO: 查询订单状态
    // Status {
    //     /// 订单号
    //     #[arg(short, long)]
    //     order_id: String,
    // },

    // TODO: 管理乘客列表
    // Passenger {
    //     #[command(subcommand)]
    //     action: Option<PassengerAction>,
    // },
}

// TODO: 乘客管理子命令
// #[derive(Subcommand, Debug, Clone)]
// pub enum PassengerAction {
//     /// 列出所有乘客
//     List,
//     /// 添加乘客
//     Add { /* ... */ },
//     /// 删除乘客
//     Remove { /* ... */ },
// }
