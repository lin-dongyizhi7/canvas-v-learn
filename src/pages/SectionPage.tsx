import { Link, Navigate, useParams } from "react-router-dom";
import { SectionCard } from "../components/SectionCard";
import {
  buildModulePath,
  buildSectionPath,
  getModuleById,
  getSectionById,
} from "../data/modules";

export function SectionPage() {
  const params = useParams<{ moduleId: string; sectionId: string }>();
  const module = getModuleById(params.moduleId);
  const section = getSectionById(params.moduleId, params.sectionId);

  if (!module || !section) {
    return <Navigate to="/" replace />;
  }

  const currentIndex = module.sections.findIndex((item) => item.id === section.id);
  const previousSection = currentIndex > 0 ? module.sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < module.sections.length - 1 ? module.sections[currentIndex + 1] : null;

  return (
    <>
      <section className="hero">
        <div>
          <p className="module-card__meta">{module.title} · 章节学习</p>
          <h2 className="hero__title">{section.title}</h2>
          <p className="hero__subtitle">{section.summary}</p>
        </div>

        <div className="section-links">
          <Link className="section-link" to={buildModulePath(module.id)}>
            返回模块目录
          </Link>
          {previousSection ? (
            <Link
              className="section-link"
              to={buildSectionPath(module.id, previousSection.id)}
            >
              上一节：{previousSection.title}
            </Link>
          ) : null}
          {nextSection ? (
            <Link
              className="section-link"
              to={buildSectionPath(module.id, nextSection.id)}
            >
              下一节：{nextSection.title}
            </Link>
          ) : null}
        </div>
      </section>

      <SectionCard section={section} />

      <p className="footer-tip">
        这一节啃完之后，建议继续按顺序往后走。章节分路由以后，复习和分享链接都会顺手很多，
        终于不像一卷超长竹简了。
      </p>
    </>
  );
}
