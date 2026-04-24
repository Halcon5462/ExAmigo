import React, { useMemo, useState } from 'react';

const AchievementsBlock = ({ achievements = [], toAbsoluteMediaUrl }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const sorted = useMemo(() => {
    const list = Array.isArray(achievements) ? achievements.slice() : [];
    list.sort((a, b) => {
      const ao = a?.is_obtained ? 1 : 0;
      const bo = b?.is_obtained ? 1 : 0;
      return bo - ao;
    });
    return list;
  }, [achievements]);

  return (
    <div className="profilePage_achievementsBlock">
      <div className="profilePage_sectionHeader">
        <h2 className="profilePage_sectionTitle text">Мои достижения</h2>
        <button
          type="button"
          className="profilePage_sectionToggle text_mini"
          onClick={() => setIsCollapsed((v) => !v)}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? 'Развернуть' : 'Свернуть'}
        </button>
      </div>

      {isCollapsed ? null : (
        <div className="profilePage_achievements">
          {sorted.length === 0 ? (
          <div className="profilePage_empty description_text">Нет достижений</div>
          ) : (
            sorted.map((ach) => {
              const iconSrc = toAbsoluteMediaUrl ? toAbsoluteMediaUrl(ach?.icon) : ach?.icon;
              const percent = Number.isFinite(ach?.progress_percent) ? ach.progress_percent : 0;
              const current = Number.isFinite(ach?.current_value) ? ach.current_value : 0;
              const target = Number.isFinite(ach?.target) ? ach.target : 0;
              const isObtained = !!ach?.is_obtained;

              return (
                <div
                  key={ach.id}
                  className={`profilePage_achievement ${isObtained ? 'isObtained' : 'isLocked'}`}
                >
                  <div className="profilePage_achievementMain">
                    {iconSrc ? (
                      <img
                        src={iconSrc}
                        alt={ach?.name || 'achievement'}
                        className="profilePage_achievementIcon"
                      />
                    ) : null}
                    <div className="profilePage_achievementInfo">
                      <div className="profilePage_achievementName text_mini">
                        {ach?.name}{isObtained ? ' ✓' : ''}
                      </div>
                      <div className="profilePage_achievementDesc description_text">
                        {ach?.description}
                      </div>
                      {ach?.reward ? (
                        <div className="profilePage_achievementReward text_mini">
                          Награда: {ach.reward}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="profilePage_achievementProgress">
                    <div className="profilePage_progressBar">
                      <div
                        className="profilePage_progressFill"
                        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                      />
                    </div>
                    <div className="profilePage_progressMeta text_mini">
                      {current} / {target} ({percent}%)
                    </div>
                    <div className="profilePage_achievementDate text_mini">
                      {isObtained && ach?.earned_at
                        ? `Получено: ${new Date(ach.earned_at).toLocaleDateString()}`
                        : 'Еще не получено'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementsBlock;