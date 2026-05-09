import { defineComponent, h } from "vue";

const principles = [
  {
    key: "责任",
    text: "公共权力必须能被追问，责任链条不能停在内部解释。",
  },
  {
    key: "监督",
    text: "监督不是情绪否定，而是稳定、持续、可复核的制度接口。",
  },
  {
    key: "流程",
    text: "流程让意见、判断、执行与纠错形成可追踪的公共记录。",
  },
  {
    key: "参与",
    text: "公民参与不止于投票，也包括对治理过程的评价与校正。",
  },
];

export const OrderPrinciples = defineComponent({
  name: "OrderPrinciples",
  render() {
    return h(
      "div",
      {
        class: "principles-grid",
        "aria-label": "公民秩序主义原则",
      },
      principles.map((item) =>
        h("article", { class: "principle-card", key: item.key }, [
          h("span", item.key),
          h("p", item.text),
        ]),
      ),
    );
  },
});
