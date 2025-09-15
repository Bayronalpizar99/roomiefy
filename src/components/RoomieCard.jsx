import React from "react";
import * as Avatar from "@radix-ui/react-avatar";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Star, MapPin, Home, Users, DollarSign, Verified } from "lucide-react";
import "./RoomieCard.css";

export default function RoommateCard({ roommate = {}, onClick = () => {} }) {
  return (
    <Tooltip.Provider>
        
      <div className="card cursor-pointer" onClick={() => onClick(roommate)}>
        <div className="card-content">
          {/* Avatar con verificación */}
          <div className="relative">
            <Avatar.Root className="avatar">
              <Avatar.Image
                src={roommate?.avatar || ""}
                alt={roommate?.name || "Usuario"}
                className="avatar-img"
              />
              <Avatar.Fallback className="avatar-fallback">
                {roommate?.name?.charAt(0) || "?"}
              </Avatar.Fallback>
            </Avatar.Root>

            {roommate?.verified && (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Verified className="verified-icon" />
                </Tooltip.Trigger>
                <Tooltip.Content className="tooltip">
                  <p>Perfil verificado</p>
                </Tooltip.Content>
              </Tooltip.Root>
            )}
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Nombre y edad */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{roommate?.name || "Desconocido"}</h3>
              <span className="text-sm text-gray-500">{roommate?.age || "--"} años</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{roommate?.rating || "0"}</span>
              <span className="text-xs text-gray-500">({roommate?.reviews || "0"})</span>
            </div>

            {/* Ubicación */}
            <div className="flex items-center gap-1 mb-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{roommate?.location || "Sin ubicación"}</span>
            </div>

            {/* Estado apartamento */}
            <div className="mb-3">
              <span
                className={`badge ${
                  roommate?.hasApartment ? "badge-default" : "badge-secondary"
                }`}
              >
                {roommate?.hasApartment ? (
                  <Home className="h-3 w-3" />
                ) : (
                  <Users className="h-3 w-3" />
                )}
                {roommate?.hasApartment ? "Tiene apartamento" : "Busca apartamento"}
              </span>
            </div>

            {/* Presupuesto */}
            <div className="flex items-center gap-1 mb-3 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>
                ${roommate?.budget?.min || 0} - ${roommate?.budget?.max || 0}
              </span>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-500 mb-3">{roommate?.bio || "Sin descripción"}</p>

            {/* Intereses */}
            <div className="flex flex-wrap gap-1">
              {roommate?.interests?.slice(0, 3)?.map((interest) => (
                <span key={interest} className="badge badge-outline">
                  {interest}
                </span>
              ))}
              {roommate?.interests?.length > 3 && (
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span className="badge badge-outline cursor-help">
                      +{roommate.interests.length - 3}
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="tooltip max-w-60">
                    <p className="text-xs mb-1">Otros intereses:</p>
                    <div className="flex flex-wrap gap-1">
                      {roommate.interests.slice(3).map((interest) => (
                        <span key={interest} className="badge badge-secondary">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </Tooltip.Content>
                </Tooltip.Root>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
