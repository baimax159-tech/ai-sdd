// PHASE_SPEC[phase] = { requiredSections, idKinds, traceKind, traceUpstream, coverageRequired }
//   traceUpstream    = 反向：本阶段下游元素的 covers 只能引用这些上游种类（有效性）
//   coverageRequired = 正向：上游这些种类的每个 ID 必须被本阶段下游 covers 100% 覆盖（完整性，零缺失）
export const PHASE_SPEC = {
  P1:  { requiredSections: ['原始需求','目标与非目标','场景地图','验收标准','反向场景','NFR','数据模型','待澄清','术语','覆盖自审'],
         idKinds: ['AC','AC-FAIL','NFR'], traceKind: null, traceUpstream: [], coverageRequired: [] },
  P1p: { requiredSections: ['对比对象','差异清单','合并规则','行为一致性声明'],
         idKinds: ['DF'], traceKind: null, traceUpstream: [], coverageRequired: [] },
  P2:  { requiredSections: ['需求覆盖映射','数据模型','接口定义','模块层划分','决策记录','实现单元清单','验证命令锚点'],
         idKinds: ['IU','ADR'], traceKind: 'IU', traceUpstream: ['AC','AC-FAIL','NFR','DF'], coverageRequired: ['AC','AC-FAIL','NFR','DF'],
         commandAnchor: true }, // 质量闸：验证命令锚点的 test 行必须是可执行命令（C）
  P3:  { requiredSections: ['执行计划','Task 协议','需求追溯表'],
         idKinds: ['Task'], traceKind: 'Task', traceUpstream: ['IU'], coverageRequired: ['IU'],
         taskArtifacts: ['file','test'] }, // 规划期闸：每个 Task 行必须有非空 file:/test:（§4.3 双闸之一）
  P4:  { requiredSections: ['覆盖矩阵','通过判据','验证命令','回滚预案'],
         idKinds: ['V'], traceKind: 'V', traceUpstream: ['AC','AC-FAIL','NFR','DF'], coverageRequired: ['AC','AC-FAIL','NFR','DF'],
         numericCriteria: true, executableCommands: true }, // 质量闸：判据数值化 + 命令可执行（A）
};
