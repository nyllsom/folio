# 从要点到解释

仅在需要把握写作尺度时阅读此例。

## 输入片段

> Store-and-forward: receive entire packet before transmitting.
> Packet length L bits; link rate R bps; transmission delay L/R.
> Two links, one router: 2L/R (ignore propagation).

## 改写正文

存储转发（Store-and-Forward）要求路由器完整接收一个分组（Packet）后，才能把它发送到下一条链路。设分组长度为 L 比特（bit），链路传输速率为 R 比特每秒（bits per second，bps），把整个分组送入链路所需的传输时延（Transmission Delay）为 L/R 秒。

如果源主机与目标主机之间有一个路由器，两段链路的速率均为 R，那么单个分组需要经历两次完整发送。在忽略传播、处理和排队时延的条件下，从源主机开始发送到目标主机完整收到分组，总共需要 2L/R 秒。这个结果依赖存储转发和两段链路等速的假设，不能直接套用于任意网络路径。

## 检查重点

正文直接说明机制，没有引用课件的语气；保留了公式、变量、单位和条件；术语首次写全；解释以段落展开。若原材料没有说明其他时延，需核实这个简化模型，不能把忽略项当作一般事实。
